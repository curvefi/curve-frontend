import { noop } from 'lodash'
import type { StellarContract } from '@/stellar/features/connect-wallet/address'
import { SwapTab } from '@/stellar/features/swap/SwapTab'
import { checkEstimatedTxCost } from '@cy/support/helpers/llamalend/action-info.helpers'
import { connectTestWallet, deployTestPool } from '@cy/support/helpers/stellar/connector'
import { seedTestPool } from '@cy/support/helpers/stellar/deposit.helpers'
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
  selectSwapToken,
  submitSwapForm,
  swapInput,
  swapAmountInput,
  swapSubmit,
  writeSwapAmount,
} from '@cy/support/helpers/stellar/swap.helpers'
import { LOAD_TIMEOUT, skipTestsAfterFailure, TRANSACTION_LOAD_TIMEOUT } from '@cy/support/ui'
import type { Decimal } from '@primitives/decimal.utils'
import { SWAP_FIELDS } from '@ui/features/pool-forms/swap/swap-form.utils'

const SWAP_AMOUNT = '0.0001' satisfies Decimal

describe('Stellar testnet swap', () => {
  skipTestsAfterFailure()

  let testnetConfig: TestnetConfig
  let pool: StellarContract
  let state: PoolState

  before(() => {
    getTestnetConfig()
      .then(config => {
        testnetConfig = config
        return connectTestWallet(config)
      })
      .then(TRANSACTION_LOAD_TIMEOUT, () => deployTestPool(testnetConfig))
      .then(LOAD_TIMEOUT, deployedPool => (pool = deployedPool))
      .then(TRANSACTION_LOAD_TIMEOUT, () => seedTestPool(pool, testnetConfig))
  })

  beforeEach(() => {
    cy.then(LOAD_TIMEOUT, () => fetchPoolState(pool, testnetConfig)).then(fresh => (state = fresh))
  })

  const mountSwap = ({ connected = true } = {}) => {
    cy.mount(
      <StellarTestWrapper address={connected ? testnetConfig.deployer.address : undefined}>
        <SwapTab network={TEST_NETWORK} pool={pool} />
      </StellarTestWrapper>,
    )
    if (connected) checkSwapBalances(state, 0, 1)
  }

  it('previews amounts without a connected wallet', () => {
    mountSwap({ connected: false })
    writeSwapAmount('pay', SWAP_AMOUNT)
    swapAmountInput('receive').should(input => expect(Number(input.val())).to.be.greaterThan(0))
    cy.get('[data-testid="pool-swap-connect-wallet"]', LOAD_TIMEOUT).should('be.enabled')
    swapSubmit().should('not.exist')
  })

  it('loads wallet balances and fills the pay amount with Max', () => {
    mountSwap()
    swapSubmit().should('be.disabled')
    swapInput('pay').find('[data-testid="input-chip-Max"]').click()
    swapAmountInput('pay').should('have.value', state.coins[0].balance)
  })

  ;(
    [
      { label: 'a pay amount', side: 'pay', fromIndex: 0, toIndex: 1, selectPair: noop },
      { label: 'a receive amount', side: 'receive', fromIndex: 0, toIndex: 1, selectPair: noop },
      {
        label: 'a different receiving token',
        side: 'pay',
        fromIndex: 0,
        toIndex: 2,
        selectPair: () => selectSwapToken('receive', state.coins[2]),
      },
      {
        label: 'a different paying token',
        side: 'receive',
        fromIndex: 2,
        toIndex: 1,
        selectPair: () => selectSwapToken('pay', state.coins[2]),
      },
      {
        label: 'the reversed pair',
        side: 'pay',
        fromIndex: 1,
        toIndex: 0,
        selectPair: () => cy.get('[data-testid="pool-swap-reverse"]').click(),
      },
    ] as const
  ).forEach(({ label, side, fromIndex, toIndex, selectPair }) => {
    it(`swaps ${label} and refreshes wallet balances`, () => {
      mountSwap()

      selectPair()
      checkSwapBalances(state, fromIndex, toIndex)
      writeSwapAmount(side, SWAP_AMOUNT)
      swapSubmit().should('be.enabled')
      readSwapAmounts().then(amounts => {
        expect(amounts[SWAP_FIELDS[side].amountField]).to.equal(SWAP_AMOUNT)
        expect(+amounts.inputAmount).to.be.greaterThan(0)
        expect(+amounts.outputAmount).to.be.greaterThan(0)
        if (side === 'pay') checkSwapDetails(amounts, state.coins[fromIndex], state.coins[toIndex])
        checkEstimatedTxCost()
        checkPoolSlippage()
        checkPoolPriceImpact()
        submitSwapForm()
        cy.then(LOAD_TIMEOUT, () => fetchPoolState(pool, testnetConfig)).then(fresh => {
          // get_dx is approximate, so a receive-side swap can return more than requested.
          const expectedResult = {
            pay: {
              inputAmount: amounts.inputAmount,
              minimumOutputAmount: amounts.outputAmount,
              outputAmount: amounts.outputAmount,
            },
            receive: { inputAmount: amounts.inputAmount, minimumOutputAmount: amounts.outputAmount },
          }[side]
          checkSwapResult(state, fresh, expectedResult, fromIndex, toIndex)
        })
      })
    })
  })
})
