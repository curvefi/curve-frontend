import type { StellarContract } from '@/stellar/features/connect-wallet/address'
import { PoolPage } from '@/stellar/features/pool/PoolPage'
import { StellarUrls } from '@/stellar/routes/routes'
import { oneBool, oneOf } from '@cy/support/generators'
import { connectTestWallet, deployTestPool } from '@cy/support/helpers/stellar/connector'
import { checkPoolInputError, poolInput, TEST_NETWORK, writePoolAmount } from '@cy/support/helpers/stellar/pool.helpers'
import { getTestnetConfig, type TestnetConfig } from '@cy/support/helpers/stellar/stellar-testnet.config'
import { StellarTestWrapper } from '@cy/support/helpers/stellar/StellarTestWrapper'
import {
  checkPartialWithdrawQuote,
  checkWithdrawBalances,
  fetchWithdrawState,
  seedPoolAndTransferMostLpToIssuer,
  selectWithdrawMax,
  submitWithdrawAndCheck,
  withdrawLpInput,
  type WithdrawState,
  withdrawSubmit,
  writeWithdrawLp,
} from '@cy/support/helpers/stellar/withdraw.helpers'
import { createComponentTestRouter } from '@cy/support/routes'
import { TIMEOUTS } from '@cy/support/timeout-categories'
import { skipTestsAfterFailure } from '@cy/support/ui'
import type { Decimal } from '@primitives/decimal.utils'
import { RouterProvider } from '@tanstack/react-router'
import { useUserProfileStore } from '@ui/features/user-profile/store'
import { decimalSum } from '@ui/lib/decimal'

const WITHDRAW_LP_AMOUNT = '0.003' satisfies Decimal
const SINGLE_COIN_OUTPUT_AMOUNT = '0.0001' satisfies Decimal

describe('Stellar testnet withdraw', () => {
  skipTestsAfterFailure()

  let testnetConfig: TestnetConfig
  let pool: StellarContract
  let state: WithdrawState

  before(() => {
    getTestnetConfig()
      .then(async config => {
        testnetConfig = config
        await connectTestWallet(config)
      })
      .then(TIMEOUTS['stellar.deployPool'], async () => await deployTestPool(testnetConfig))
      .then(TIMEOUTS['ui.render'], deployedPool => (pool = deployedPool))
  })

  beforeEach(() =>
    cy
      .then(TIMEOUTS['stellar.read'], async () => await fetchWithdrawState(pool, testnetConfig))
      .then(freshState => (state = freshState)),
  )

  const mountWithdraw = ({ connected = true } = {}) => {
    cy.mount(
      <StellarTestWrapper address={connected ? testnetConfig.deployer.address : undefined}>
        <RouterProvider
          router={createComponentTestRouter({
            component: PoolPage,
            path: 'dex/$network/pools/$pool',
            initialEntry: StellarUrls.pool({ network: TEST_NETWORK, pool }),
          })}
        />
      </StellarTestWrapper>,
    )
    cy.get('[data-testid="tab-withdraw"]', TIMEOUTS['ui.interaction']).click()
    if (connected) checkWithdrawBalances(state)
  }

  it('disables withdrawals from an unseeded pool', () => {
    expect(state.supply).to.equal('0')
    mountWithdraw()
    withdrawLpInput().find('input').should('be.disabled')
    withdrawSubmit().should('be.disabled')
  })

  describe('seeded pool', () => {
    before(() => cy.then(TIMEOUTS['stellar.seedPool'], () => seedPoolAndTransferMostLpToIssuer(pool, testnetConfig)))

    it('requires a connected wallet', () => {
      mountWithdraw({ connected: false })
      state.coins.map(({ address }) => poolInput(address).should('be.visible'))
      cy.get('[data-testid="pool-withdraw-connect-wallet"]', TIMEOUTS['ui.render']).should('be.enabled')
      withdrawSubmit().should('not.exist')
    })

    it('rejects invalid LP and token amounts and recovers after correction', () => {
      const coin = oneOf(...state.coins)
      const lpBudget = '0.001' satisfies Decimal
      const overBudgetOutput = '0.003' satisfies Decimal
      mountWithdraw()

      // LP validation: empty, zero, and above the wallet balance.
      withdrawSubmit().should('be.disabled')
      ;[
        { amount: '0' as Decimal, message: 'Enter an LP amount' },
        { amount: decimalSum(state.lp.balance, '1'), message: 'Insufficient LP balance' },
      ].forEach(({ amount, message }) => {
        writeWithdrawLp(amount)
        withdrawLpInput().find('[data-testid="helper-message-error"]').should('contain.text', message)
        withdrawSubmit().should('be.disabled')
      })

      // Output validation: zero, above the token maximum, and above the LP budget.
      writeWithdrawLp(lpBudget)
      state.coins.forEach(({ address }) => writePoolAmount(address, '0'))
      cy.get('[data-testid="loan-form-error-root"]').should('contain.text', 'Enter an amount to withdraw')
      withdrawSubmit().should('be.disabled')

      writePoolAmount(coin.address, decimalSum(state.reserves[state.coins.indexOf(coin)], '1'))
      checkPoolInputError(coin.address, 'Amount exceeds the maximum withdrawal')
      withdrawSubmit().should('be.disabled')

      writePoolAmount(coin.address, overBudgetOutput)
      cy.get('[data-testid="loan-form-error-root"]', TIMEOUTS['ui.render']).should(
        'contain.text',
        'Maximum LP required exceeds the LP amount',
      )
      withdrawSubmit().should('be.disabled')
      poolInput(coin.address).find('input').should('have.value', overBudgetOutput)

      // Recovery: correcting the amount clears errors and enables withdrawal.
      writePoolAmount(coin.address, SINGLE_COIN_OUTPUT_AMOUNT)
      withdrawLpInput().find('[data-testid="helper-message-error"]').should('not.exist')
      state.coins.map(({ address }) =>
        poolInput(address).find('[data-testid="helper-message-error"]').should('not.exist'),
      )
      cy.get('[data-testid="loan-form-error-root"]').should('not.exist')
      withdrawSubmit().should('be.enabled')
    })

    it('fills balanced outputs with LP Max and preserves edits until the next LP change', () => {
      mountWithdraw()
      withdrawLpInput().find('[data-testid="input-chip-Max"]').click()
      withdrawLpInput().find('input').should('have.value', state.lp.balance)
      const slippage = +useUserProfileStore.getState().maxSlippage.stable
      state.coins.map(({ address, decimals }, index) =>
        poolInput(address)
          .find('input')
          .should(input =>
            expect(+input.val()!).to.be.closeTo(
              (+state.reserves[index] * +state.lp.balance) / +state.supply / (1 + slippage / 100),
              10 ** -decimals,
            ),
          ),
      )
      const { address } = oneOf(...state.coins)
      writePoolAmount(address, SINGLE_COIN_OUTPUT_AMOUNT)
      withdrawLpInput().find('input').should('have.value', state.lp.balance)
      withdrawSubmit().should('be.enabled')
      poolInput(address).find('input').should('have.value', SINGLE_COIN_OUTPUT_AMOUNT)
      writeWithdrawLp(WITHDRAW_LP_AMOUNT)
      poolInput(address).find('input').should('not.have.value', SINGLE_COIN_OUTPUT_AMOUNT)
    })

    it('withdraws quoted amounts and refreshes the displayed balances', () => {
      const singleCoin = oneBool() ? oneOf(...state.coins) : undefined
      cy.log(`Withdraw ${singleCoin?.symbol ?? 'balanced outputs'}`)
      mountWithdraw()
      writeWithdrawLp(WITHDRAW_LP_AMOUNT)
      if (singleCoin) {
        state.coins.forEach(({ address }) =>
          writePoolAmount(address, address === singleCoin.address ? SINGLE_COIN_OUTPUT_AMOUNT : '0'),
        )
      }
      checkPartialWithdrawQuote(state, WITHDRAW_LP_AMOUNT)
      submitWithdrawAndCheck(state)
    })

    it('allows editing Max and withdraws the full LP balance into one coin', () => {
      const coin = oneOf(...state.coins)
      cy.log(`Withdraw Max into ${coin.symbol}`)
      mountWithdraw()
      writeWithdrawLp('0.001')
      selectWithdrawMax(state, coin)

      // Editing Max restores an ordinary withdrawal quote without changing the LP budget.
      writePoolAmount(coin.address, SINGLE_COIN_OUTPUT_AMOUNT)
      poolInput(coin.address).find('input').should('have.value', SINGLE_COIN_OUTPUT_AMOUNT)
      withdrawLpInput().find('input').should('have.value', state.lp.balance)
      checkPartialWithdrawQuote(state, state.lp.balance)

      selectWithdrawMax(state, coin)
      submitWithdrawAndCheck(state)
    })
  })
})
