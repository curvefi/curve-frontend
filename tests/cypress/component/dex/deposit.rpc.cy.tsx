import { parseUnits, toHex } from 'viem'
import { generatePrivateKey, privateKeyToAccount } from 'viem/accounts'
import { DepositTab } from '@/dex/features/deposit/components/DepositTab'
import { defaultNetworks } from '@/dex/lib/networks'
import { oneDecimal, oneOf } from '@cy/support/generators'
import { TEST_ETH_FUND_AMOUNT, TEST_POOLS, TEST_SLIPPAGE } from '@cy/support/helpers/dex/curve.helpers'
import {
  checkBalancedPoolDepositAmounts,
  checkPoolDepositDetailsLoaded,
  getPoolDepositAllowance,
  getPoolDepositAmounts,
  poolDepositInput,
  poolDepositSubmit,
  submitPoolDepositAndCheck,
  writePoolDepositForm,
} from '@cy/support/helpers/dex/deposit.helpers'
import { PoolTestCase } from '@cy/support/helpers/dex/PoolTestCase'
import { createVirtualTestnet } from '@cy/support/helpers/tenderly'
import { getRpcUrls } from '@cy/support/helpers/tenderly/vnet'
import { fundErc20, fundEth } from '@cy/support/helpers/tenderly/vnet-fund'
import { TIMEOUTS } from '@cy/support/timeout-categories'
import { skipTestsAfterFailure } from '@cy/support/ui'
import type { Decimal } from '@primitives/decimal.utils'
import { Chain } from '@primitives/network.utils'
import { range } from '@primitives/objects.utils'
import { DEFAULT_DECIMALS } from '@primitives/units.util'
import type { DepositType } from '@ui/features/pool-forms/deposit/deposit-form.utils'
import { constQ } from '@ui/features/queries/util'
import { decimalSum } from '@ui/lib/decimal'

const FUND_AMOUNT = '100'
const CHAIN_ID = Chain.Ethereum
const SINGLE_COIN_AMOUNT_RANGE = [1, 10] as const
const ALL_COIN_AMOUNT_RANGE = [5, 15] as const

describe('Pool Deposit (RPC)', () => {
  skipTestsAfterFailure()

  const privateKey = generatePrivateKey()
  const { address: userAddress } = privateKeyToAccount(privateKey)
  const getVirtualNetwork = createVirtualTestnet(uuid => ({
    slug: `pool-deposit-integration-${uuid}`,
    display_name: `PoolDepositIntegration (${uuid})`,
    chain_id: CHAIN_ID,
    fork_config: { block_number: 'latest' },
  }))
  const pool = oneOf(...TEST_POOLS)

  const TestWrapper = ({ type = 'advanced' }: { type?: DepositType }) => (
    <PoolTestCase vnet={getVirtualNetwork()} account={privateKey} chainId={CHAIN_ID} poolAddress={pool.address}>
      <DepositTab
        type={type}
        maxSlippage={TEST_SLIPPAGE}
        poolAlert={null}
        seed={constQ(false)}
        params={{ network: defaultNetworks[CHAIN_ID].blockchainId, poolAddress: pool.address }}
      />
    </PoolTestCase>
  )

  const submitAndCheck = (amounts: readonly Decimal[], tokenIndex?: number) =>
    submitPoolDepositAndCheck({ ...getRpcUrls(getVirtualNetwork()), userAddress, amounts, pool, tokenIndex })

  before(() => {
    cy.task('log', `Deposit test pool: ${pool.id}`)
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
        amountWei: toHex(parseUnits(FUND_AMOUNT, decimals)),
        recipientAddresses: [userAddress],
      }),
    )
  })

  it('approves and deposits a single coin, then deposits again with the existing allowance', () => {
    const from = oneOf(...range(pool.coins.length))
    const to = oneOf(...range(pool.coins.length).filter(index => index !== from))
    const coin = pool.coins[to]
    const amount = oneDecimal(...SINGLE_COIN_AMOUNT_RANGE, coin.decimals)
    const amounts = range(pool.coins.length).map((index): Decimal => (index === to ? amount : '0'))
    const selectCoin = (index: number) => {
      cy.get('[data-testid="deposit-token-select"]', TIMEOUTS['ui.render']).click()
      cy.get(`[data-testid="token-option-${pool.coins[index].address}"]`).click()
    }
    const allowanceParams = { ...getRpcUrls(getVirtualNetwork()), userAddress, tokenAddress: coin.address, pool }
    getPoolDepositAllowance(allowanceParams).should('equal', 0n)

    cy.mount(<TestWrapper type="one-coin" />)
    selectCoin(from)
    poolDepositInput(pool.coins[from].address).type(oneDecimal(...SINGLE_COIN_AMOUNT_RANGE)).blur()
    selectCoin(to)
    poolDepositInput(coin.address).type(amount).blur()
    checkPoolDepositDetailsLoaded()
    submitAndCheck(amounts, to)

    getPoolDepositAllowance(allowanceParams).should(allowance =>
      expect(allowance >= parseUnits(amount, coin.decimals)).to.equal(true),
    )
    poolDepositInput(coin.address).type(amount).blur()
    checkPoolDepositDetailsLoaded()
    submitAndCheck(amounts, to)
  })

  it('deposits all coins with different token decimals', () => {
    const amounts = pool.coins.map(({ decimals }) => oneDecimal(...ALL_COIN_AMOUNT_RANGE, decimals))
    cy.mount(<TestWrapper />)
    writePoolDepositForm(amounts, pool)
    checkPoolDepositDetailsLoaded()
    submitAndCheck(amounts)
  })

  it('blocks empty deposits and amounts exceeding the wallet balance', () => {
    const coin = oneOf(...pool.coins)
    cy.mount(<TestWrapper />)
    poolDepositSubmit().should('be.disabled')
    writePoolDepositForm(
      pool.coins.map(({ address }) =>
        address === coin.address ? decimalSum(FUND_AMOUNT, oneDecimal(...SINGLE_COIN_AMOUNT_RANGE)) : '0',
      ),
      pool,
    )
    poolDepositSubmit().should('be.disabled')
    cy.get(`[data-testid="pool-token-input-${coin.address}"]`)
      .contains('Insufficient token balance')
      .should('be.visible')
    writePoolDepositForm(
      pool.coins.map(({ address, decimals }) =>
        address === coin.address ? oneDecimal(...SINGLE_COIN_AMOUNT_RANGE, decimals) : '0',
      ),
      pool,
    )
    checkPoolDepositDetailsLoaded()
  })

  it('deposits all coins in a balanced proportion', () => {
    cy.mount(<TestWrapper />)
    cy.get('[data-testid="pool-deposit-balanced-checkbox"]', TIMEOUTS['ui.render']).find('input').check()
    checkPoolDepositDetailsLoaded()
    getPoolDepositAmounts(pool).then(amounts => {
      checkBalancedPoolDepositAmounts({ amounts, pool })
      submitAndCheck(amounts)
    })
  })

  it('deposits the maximum remaining wallet balance of one coin', () => {
    cy.mount(<TestWrapper />)
    cy.get('[data-testid^="pool-token-input-"] [data-testid="balance-value"]', TIMEOUTS['tenderly.balances'])
      .should('have.length', pool.coins.length)
      .filter((_, element) => Number(element.getAttribute('data-value')) > 0)
      .first()
      .then(balance => {
        const input = balance.closest('[data-testid^="pool-token-input-"]')
        cy.wrap(input).find('[data-testid="input-chip-Max"]').click()
        cy.wrap(input).find('input[type="text"]').should('have.attr', 'data-value', balance.attr('data-value'))
        checkPoolDepositDetailsLoaded()
        getPoolDepositAmounts(pool).then(submitAndCheck)
      })
  })
})
