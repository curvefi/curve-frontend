import type { StellarContract } from '@/stellar/features/connect-wallet/address'
import { SwapTab } from '@/stellar/features/swap/SwapTab'
import { oneDecimal, oneInt, oneOf } from '@cy/support/generators'
import { checkEstimatedTxCost } from '@cy/support/helpers/llamalend/action-info.helpers'
import { connectTestWallet, deployTestPool } from '@cy/support/helpers/stellar/connector'
import { seedTestPool } from '@cy/support/helpers/stellar/deposit.helpers'
import { mockLitePool } from '@cy/support/helpers/stellar/mock-lite-pool'
import {
  fetchPoolState,
  checkPoolSlippage,
  checkPoolPriceImpact,
  type PoolState,
  TEST_NETWORK,
} from '@cy/support/helpers/stellar/pool.helpers'
import { getTestnetConfig, type TestnetConfig } from '@cy/support/helpers/stellar/stellar-testnet.config'
import { StellarTestWrapper } from '@cy/support/helpers/stellar/StellarTestWrapper'
import {
  checkSwapBalances,
  checkSwapDetails,
  checkSwapResult,
  readSwapAmounts,
  readSwapMinimum,
  selectSwapToken,
  submitSwapForm,
  swapInput,
  swapAmountInput,
  swapSubmit,
  writeSwapAmount,
} from '@cy/support/helpers/stellar/swap.helpers'
import { TIMEOUTS } from '@cy/support/timeout-categories'
import { skipTestsAfterFailure } from '@cy/support/ui'
import { range } from '@primitives/objects.utils'
import { SWAP_FIELDS, type SwapSide } from '@ui/features/pool-forms/swap/swap-form.utils'

const [DEFAULT_FROM_INDEX, DEFAULT_TO_INDEX] = [0, 1]

describe('Stellar testnet swap', () => {
  skipTestsAfterFailure()

  let testnetConfig: TestnetConfig
  let pool: StellarContract
  let state: PoolState

  before(() => {
    getTestnetConfig()
      .then(async config => {
        testnetConfig = config
        await connectTestWallet(config)
      })
      .then(TIMEOUTS['stellar.deployPool'], () => deployTestPool(testnetConfig))
      .then(TIMEOUTS['ui.render'], deployedPool => (pool = deployedPool))
      .then(TIMEOUTS['stellar.seedPool'], () => seedTestPool(pool, testnetConfig))
  })

  beforeEach(() =>
    cy.then(TIMEOUTS['stellar.read'], () => fetchPoolState(pool, testnetConfig)).then(fresh => (state = fresh)),
  )

  const mountSwap = ({ connected = true } = {}) => {
    mockLitePool(pool)
    cy.mount(
      <StellarTestWrapper address={connected ? testnetConfig.deployer.address : undefined}>
        <SwapTab network={TEST_NETWORK} pool={pool} />
      </StellarTestWrapper>,
    )
  }

  it('previews amounts without a connected wallet', () => {
    mountSwap({ connected: false })
    writeSwapAmount('pay', oneDecimal(0.0001, 0.0005))
    swapAmountInput('receive', TIMEOUTS['stellar.simulation']).should(input =>
      expect(Number(input.val())).to.be.greaterThan(0),
    )
    cy.get('[data-testid="pool-swap-connect-wallet"]', TIMEOUTS['ui.render']).should('be.enabled')
    swapSubmit().should('not.exist')
  })

  it('loads wallet balances and fills the pay amount with Max', () => {
    mountSwap()
    checkSwapBalances(state, DEFAULT_FROM_INDEX, DEFAULT_TO_INDEX)
    swapSubmit().should('be.disabled')
    swapInput('pay').find('[data-testid="input-chip-Max"]').click()
    swapAmountInput('pay').should('have.value', state.coins[DEFAULT_FROM_INDEX].balance)
  })

  it('swaps an amount and refreshes wallet balances', () => {
    mountSwap()
    const side = oneOf<SwapSide>('pay', 'receive')
    const fromIndex = oneInt(state.coins.length)
    const toIndex = oneOf(...range(state.coins.length).filter(index => index !== fromIndex))
    const amount = oneDecimal(0.0001, 0.0005)
    const reverse = fromIndex === DEFAULT_TO_INDEX
    cy.log(`Swap ${side}: ${state.coins[fromIndex].symbol} → ${state.coins[toIndex].symbol}`)
    if (reverse) cy.get('[data-testid="pool-swap-reverse"]').click()
    else if (fromIndex !== DEFAULT_FROM_INDEX) selectSwapToken('pay', state.coins[fromIndex])
    if (toIndex !== (reverse ? DEFAULT_FROM_INDEX : DEFAULT_TO_INDEX)) selectSwapToken('receive', state.coins[toIndex])
    checkSwapBalances(state, fromIndex, toIndex)
    writeSwapAmount(side, amount)
    readSwapAmounts(side).then(amounts => {
      expect(amounts[SWAP_FIELDS[side].amountField]).to.equal(amount)
      if (side === 'pay') checkSwapDetails(amounts, state.coins[fromIndex], state.coins[toIndex])
      checkEstimatedTxCost({ category: 'stellar.simulation' })
      checkPoolSlippage()
      checkPoolPriceImpact()
      readSwapMinimum().then(minimumOutputAmount => {
        submitSwapForm()
        checkSwapResult(
          state,
          {
            inputAmount: amounts.inputAmount,
            minimumOutputAmount,
            outputAmount: side === 'pay' ? amounts.outputAmount : undefined,
          },
          fromIndex,
          toIndex,
        )
      })
    })
  })
})
