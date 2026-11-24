import { parseUnits, toHex } from 'viem'
import { generatePrivateKey, privateKeyToAccount } from 'viem/accounts'
import { AdvancedWithdrawTab } from '@/dex/features/withdraw/components/AdvancedWithdrawTab'
import { OneCoinWithdrawTab } from '@/dex/features/withdraw/components/OneCoinWithdrawTab'
import { oneBool, oneDecimal, oneOf } from '@cy/support/generators'
import {
  seedPoolForWithdraw,
  TEST_ETH_FUND_AMOUNT,
  TEST_POOLS,
  TEST_SLIPPAGE,
} from '@cy/support/helpers/dex/curve.helpers'
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
import { DEFAULT_DECIMALS } from '@primitives/units.util'
import { decimalMinus, decimalMultiply, decimalRound } from '@ui/lib/decimal'

const CHAIN_ID = Chain.Ethereum
const FUND_AMOUNT_RANGE = [50, 100] as const
// Keep liquidity for subsequent tests; only the last test withdraws everything.
const PARTIAL_WITHDRAW_RATIOS = [0.1, 0.2] as const
const EXCESSIVE_WITHDRAW_RATIOS = [1.1, 10] as const

const oneWithdrawAmount = (amount: Decimal, ratios: readonly [number, number], decimals = DEFAULT_DECIMALS) =>
  decimalRound(decimalMultiply(amount, oneDecimal(...ratios)), decimals)

const checkPartialOneCoinWithdraw = (symbol: string) => {
  getPoolWithdrawDetail('current-lp').then(current =>
    getPoolWithdrawDetail('projected-lp').should(value => expect(Number(value)).gt(0).and.lt(Number(current))),
  )
  getActionValue('pool-swap-minimum-received', 'tenderly.simulation').should(value => {
    expect(Number.parseFloat(value!)).gt(0)
    expect(value).to.include(` ${symbol}`)
  })
  cy.get('[data-testid="high-price-impact-error"]').should('not.exist')
  cy.get('[data-testid="pool-withdraw-maximum-lp-value"]').should('not.exist')
}

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
  const fundAmount = oneDecimal(...FUND_AMOUNT_RANGE)

  const mountWithdraw = ({ advanced = true } = {}) => {
    const Tab = advanced ? AdvancedWithdrawTab : OneCoinWithdrawTab
    cy.mount(
      <PoolTestCase vnet={getVirtualNetwork()} account={privateKey} chainId={CHAIN_ID} poolAddress={pool.address}>
        <Tab maxSlippage={TEST_SLIPPAGE} />
      </PoolTestCase>,
    )
    if (isWrapped) cy.get('[data-testid="pool-withdraw-wrapped-checkbox"] input').check()
  }

  before(() => {
    cy.task('log', `Withdraw test pool: ${pool.id}, wrapped: ${isWrapped}`)
    const { adminRpcUrl } = getRpcUrls(getVirtualNetwork())
    fundEth({
      adminRpcUrl,
      amountWei: toHex(parseUnits(TEST_ETH_FUND_AMOUNT, DEFAULT_DECIMALS)),
      recipientAddresses: [userAddress],
    })
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
          [oneWithdrawAmount(initialLpBalance, EXCESSIVE_WITHDRAW_RATIOS), 'Insufficient LP balance'],
        ] as const
        invalidAmounts.map(([amount, message]) => {
          writePoolWithdrawLp(amount)
          poolWithdrawLpInput().find('[data-testid="helper-message-error"]').contains(message).should('be.visible')
          poolWithdrawSubmit().should('be.disabled')
        })
        const lpAmount = oneWithdrawAmount(initialLpBalance, PARTIAL_WITHDRAW_RATIOS)
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
      const excessive = oneWithdrawAmount(amounts[index], EXCESSIVE_WITHDRAW_RATIOS, coin.decimals)
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
        writePoolWithdrawAmount(address, oneWithdrawAmount(amounts[index], PARTIAL_WITHDRAW_RATIOS, decimals)),
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
      writePoolWithdrawAmount(to.address, oneWithdrawAmount(maximum, EXCESSIVE_WITHDRAW_RATIOS, to.decimals))
      poolWithdrawInput(to.address)
        .find('[data-testid="helper-message-error"]', TIMEOUTS['tenderly.simulation'])
        .contains('Maximum LP required exceeds the available LP balance')
        .should('be.visible')
      getPoolWithdrawDetail('projected-lp').should(value => expect(Number(value!.replaceAll(',', ''))).lt(0))
      getActionValue('pool-price-impact', 'tenderly.simulation').should('include', '%')
      cy.get('[data-testid="high-price-impact-error"]').should('not.exist')
      poolWithdrawSubmit().should('be.disabled')
      writePoolWithdrawAmount(to.address, oneWithdrawAmount(maximum, PARTIAL_WITHDRAW_RATIOS, to.decimals))
    })
    checkPartialOneCoinWithdraw(to.symbol)
    submitPoolWithdrawAndCheck()
  })

  // Reuse liquidity across tests; the full withdrawal must remain last.
  it('returns from Max to manual amounts and withdraws a manually entered maximum without LP dust', () => {
    mountWithdraw({ advanced: false })
    const coin = oneOf(...coins)
    selectPoolWithdrawMax(coin.address)
    getPoolWithdrawAmount(coin.address).then(maximum => {
      writePoolWithdrawAmount(coin.address, oneWithdrawAmount(maximum, PARTIAL_WITHDRAW_RATIOS, coin.decimals))
      checkPartialOneCoinWithdraw(coin.symbol)
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
