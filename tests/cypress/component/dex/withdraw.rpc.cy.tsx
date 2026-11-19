import { parseUnits, toHex } from 'viem'
import { generatePrivateKey, privateKeyToAccount } from 'viem/accounts'
import { AdvancedWithdrawTab } from '@/dex/features/withdraw/components/AdvancedWithdrawTab'
import { OneCoinWithdrawTab } from '@/dex/features/withdraw/components/OneCoinWithdrawTab'
import { oneBool, oneDecimal, oneOf } from '@cy/support/generators'
import { seedPoolForWithdraw, TEST_POOLS } from '@cy/support/helpers/dex/curve.helpers'
import { PoolTestCase } from '@cy/support/helpers/dex/PoolTestCase'
import {
  checkPoolWithdrawDetail,
  getPoolWithdrawAmount,
  getPoolWithdrawAmounts,
  getPoolWithdrawDetail,
  getPoolWithdrawLpBalance,
  poolWithdrawInput,
  poolWithdrawLpInput,
  poolWithdrawSubmit,
  selectPoolWithdrawCoin,
  selectPoolWithdrawMax,
  submitPoolWithdrawAndCheck,
  writePoolWithdrawAmount,
  writePoolWithdrawLp,
} from '@cy/support/helpers/dex/withdraw.helpers'
import { getActionValue } from '@cy/support/helpers/llamalend/action-info.helpers'
import { createVirtualTestnet } from '@cy/support/helpers/tenderly'
import { getRpcUrls } from '@cy/support/helpers/tenderly/vnet'
import { fundErc20, fundEth } from '@cy/support/helpers/tenderly/vnet-fund'
import { TIMEOUTS } from '@cy/support/timeout-categories'
import { skipTestsAfterFailure } from '@cy/support/ui'
import type { Decimal } from '@primitives/decimal.utils'
import { Chain } from '@primitives/network.utils'
import { decimalMinus, decimalSum } from '@ui/lib/decimal'

const CHAIN_ID = Chain.Ethereum

describe('Pool Withdraw (RPC)', () => {
  skipTestsAfterFailure()

  const privateKey = generatePrivateKey()
  const { address: userAddress } = privateKeyToAccount(privateKey)
  const getVirtualNetwork = createVirtualTestnet(uuid => ({
    slug: `pool-withdraw-integration-${uuid}`,
    display_name: `PoolWithdrawIntegration (${uuid})`,
    chain_id: CHAIN_ID,
    fork_config: { block_number: 'latest' },
  }))
  const pool = oneOf(...TEST_POOLS)
  const isWrapped = !!pool.wrappedCoins && oneBool()
  const coins = isWrapped ? pool.wrappedCoins! : pool.coins
  const fundAmount = oneDecimal(50, 100)

  const mountWithdraw = ({ advanced = true } = {}) => {
    const Tab = advanced ? AdvancedWithdrawTab : OneCoinWithdrawTab
    cy.mount(
      <PoolTestCase vnet={getVirtualNetwork()} account={privateKey} chainId={CHAIN_ID} poolAddress={pool.address}>
        <Tab maxSlippage="0.5" />
      </PoolTestCase>,
    )
    if (isWrapped) cy.get('[data-testid="pool-withdraw-wrapped-checkbox"] input').check()
  }

  before(() => {
    cy.task('log', `Withdraw test pool: ${pool.id}, wrapped: ${isWrapped}`)
    const { adminRpcUrl } = getRpcUrls(getVirtualNetwork())
    fundEth({ adminRpcUrl, amountWei: toHex(parseUnits('100', 18)), recipientAddresses: [userAddress] })
    pool.coins.map(({ address, decimals }) =>
      fundErc20({
        adminRpcUrl,
        tokenAddress: address,
        amountWei: toHex(parseUnits(fundAmount, decimals)),
        recipientAddresses: [userAddress],
      }),
    )
    mountWithdraw()
    poolWithdrawLpInput().should('be.visible')
    seedPoolForWithdraw(
      pool.address,
      pool.coins.map(() => fundAmount),
    )
  })

  it('validates LP amounts and withdraws balanced amounts', () => {
    mountWithdraw()
    poolWithdrawSubmit().should('be.disabled')
    getPoolWithdrawLpBalance()
      .should(value => expect(Number(value)).gt(0))
      .then(value => {
        const initialLpBalance = value as Decimal
        const invalidAmounts = [
          ['0', 'Enter a valid LP amount'],
          [decimalSum(initialLpBalance, '1'), 'Insufficient LP balance'],
        ] as const
        invalidAmounts.map(([amount, message]) => {
          writePoolWithdrawLp(amount)
          poolWithdrawLpInput().find('[data-testid="helper-message-error"]').contains(message).should('be.visible')
          poolWithdrawSubmit().should('be.disabled')
        })
        const lpAmount = oneDecimal(+initialLpBalance * 0.1, +initialLpBalance * 0.2)
        writePoolWithdrawLp(lpAmount)
        checkPoolWithdrawDetail('projected-lp', decimalMinus(initialLpBalance, lpAmount))
        cy.get('[data-testid="withdraw-unbalanced-checkbox"] input').should('not.be.checked')
        submitPoolWithdrawAndCheck()
      })
  })

  it('keeps unbalanced outputs independent, rejects excessive LP burn and withdraws corrected amounts', () => {
    mountWithdraw()
    poolWithdrawLpInput().find('[data-testid="input-chip-Max"]', TIMEOUTS['tenderly.balances']).click()
    checkPoolWithdrawDetail('projected-lp', '0')
    getPoolWithdrawAmounts(coins).then(amounts => {
      cy.get('[data-testid="withdraw-unbalanced-checkbox"] input').check()
      cy.get('[data-testid="pool-withdraw-lp-input"]').should('not.exist')
      const coin = oneOf(...coins)
      const index = coins.indexOf(coin)
      const excessive = oneDecimal(+amounts[index] * 3, +amounts[index] * 4, coin.decimals)
      writePoolWithdrawAmount(coin.address, excessive)
      coins.map(({ address }, i) =>
        poolWithdrawInput(address)
          .find('input[name^="amount"]')
          .should('have.attr', 'data-value', i === index ? excessive : amounts[i]),
      )
      cy.get('[data-testid="loan-form-errors"]', TIMEOUTS['tenderly.simulation'])
        .contains('Maximum LP required exceeds the available LP balance')
        .should('be.visible')
      poolWithdrawSubmit().should('be.disabled')
      coins.map(({ address, decimals }, index) =>
        writePoolWithdrawAmount(address, oneDecimal(+amounts[index] * 0.1, +amounts[index] * 0.2, decimals)),
      )
    })
    getActionValue('pool-withdraw-maximum-lp', 'tenderly.simulation').should(value => expect(Number(value)).gt(0))
    submitPoolWithdrawAndCheck()
  })

  it('clears the amount on token changes and withdraws a corrected manual amount', () => {
    mountWithdraw({ advanced: false })
    const from = oneOf(...coins)
    const to = oneOf(...coins.filter(coin => coin.address !== from.address))
    selectPoolWithdrawMax(from.address)
    selectPoolWithdrawCoin(to.address)
    poolWithdrawInput(to.address).find('input[name^="amount"]').should('have.value', '')
    cy.get(`[data-testid="pool-token-input-${from.address}"]`).should('not.exist')
    poolWithdrawSubmit().should('be.disabled')
    selectPoolWithdrawMax(to.address)
    getPoolWithdrawAmount(to.address).then(maximum => {
      writePoolWithdrawAmount(to.address, '0')
      poolWithdrawSubmit().should('be.disabled')
      writePoolWithdrawAmount(to.address, oneDecimal(+maximum * 2, +maximum * 3, to.decimals))
      cy.get('[data-testid="loan-form-errors"]', TIMEOUTS['tenderly.simulation'])
        .contains('Maximum LP required exceeds the available LP balance')
        .should('be.visible')
      poolWithdrawSubmit().should('be.disabled')
      writePoolWithdrawAmount(to.address, oneDecimal(+maximum * 0.1, +maximum * 0.2, to.decimals))
    })
    getActionValue('pool-withdraw-maximum-lp', 'tenderly.simulation').should(value => expect(Number(value)).gt(0))
    submitPoolWithdrawAndCheck()
  })

  // Reuse liquidity across tests; the full withdrawal must remain last.
  it('returns from Max to manual amounts and withdraws a manually entered maximum without LP dust', () => {
    mountWithdraw({ advanced: false })
    const coin = oneOf(...coins)
    selectPoolWithdrawMax(coin.address)
    getPoolWithdrawAmount(coin.address).then(maximum => {
      writePoolWithdrawAmount(coin.address, oneDecimal(+maximum * 0.1, +maximum * 0.2, coin.decimals))
      getActionValue('pool-withdraw-maximum-lp', 'tenderly.simulation').should(value => expect(Number(value)).gt(0))
      getPoolWithdrawDetail('projected-lp').should(value => expect(Number(value)).gt(0))
      writePoolWithdrawAmount(coin.address, maximum)
    })
    checkPoolWithdrawDetail('projected-lp', '0')
    cy.get('[data-testid="pool-withdraw-maximum-lp-value"]').should('not.exist')
    submitPoolWithdrawAndCheck()
    mountWithdraw()
    getPoolWithdrawLpBalance().should('equal', '0')
    poolWithdrawSubmit().should('be.disabled')
  })
})
