import type { StellarContract } from '@/stellar/features/connect-wallet/address'
import { WithdrawTab } from '@/stellar/features/withdraw/WithdrawTab'
import { oneDecimal, oneInt, oneOf } from '@cy/support/generators'
import { checkEstimatedTxCost } from '@cy/support/helpers/llamalend/action-info.helpers'
import { connectTestWallet, deployTestPool } from '@cy/support/helpers/stellar/connector'
import { seedTestPool } from '@cy/support/helpers/stellar/deposit.helpers'
import {
  checkPoolInputError,
  poolInput,
  readPoolAmounts,
  TEST_NETWORK,
  writePoolAmount,
} from '@cy/support/helpers/stellar/pool.helpers'
import { getTestnetConfig, type TestnetConfig } from '@cy/support/helpers/stellar/stellar-testnet.config'
import { StellarTestWrapper } from '@cy/support/helpers/stellar/StellarTestWrapper'
import {
  checkPartialWithdrawQuote,
  checkWithdrawBalances,
  checkWithdrawDetail,
  fetchWithdrawState,
  seedPoolAndTransferMostLpToIssuer,
  selectWithdrawMax,
  submitWithdrawAndCheck,
  withdrawLpInput,
  type WithdrawState,
  withdrawSubmit,
  writeWithdrawLp,
} from '@cy/support/helpers/stellar/withdraw.helpers'
import { TIMEOUTS } from '@cy/support/timeout-categories'
import { skipTestsAfterFailure } from '@cy/support/ui'
import type { Decimal } from '@primitives/decimal.utils'
import { SLIPPAGE } from '@ui/features/forms/slippage/slippage.utils'
import { decimalMinus, decimalSum } from '@ui/lib/decimal'

describe('Stellar testnet withdraw', () => {
  skipTestsAfterFailure()

  let testnetConfig: TestnetConfig
  let pool: StellarContract
  let state: WithdrawState

  const refreshState = () =>
    cy.then(TIMEOUTS['stellar.read'], () => fetchWithdrawState(pool, testnetConfig)).then(fresh => (state = fresh))

  before(() => {
    getTestnetConfig()
      .then(async config => {
        testnetConfig = config
        await connectTestWallet(config)
      })
      .then(TIMEOUTS['stellar.deployPool'], () => deployTestPool(testnetConfig))
      .then(deployedPool => (pool = deployedPool))
      .then(refreshState)
  })

  const mountWithdraw = ({ connected = true } = {}) => {
    cy.mount(
      <StellarTestWrapper address={connected ? testnetConfig.deployer.address : undefined}>
        <WithdrawTab network={TEST_NETWORK} pool={pool} />
      </StellarTestWrapper>,
    )
    if (connected) checkWithdrawBalances(state)
  }

  it('disables unseeded withdrawals and requires a connected wallet', () => {
    expect(state.supply).to.equal('0')
    mountWithdraw()
    withdrawLpInput().find('input').should('be.disabled')
    withdrawSubmit().should('be.disabled')
    mountWithdraw({ connected: false })
    cy.get('[data-testid="pool-withdraw-connect-wallet"]').should('be.enabled')
    withdrawSubmit().should('not.exist')
  })

  describe('seeded pool', () => {
    beforeEach(() =>
      cy
        .then(TIMEOUTS['stellar.seedPool'], () => seedPoolAndTransferMostLpToIssuer(pool, testnetConfig))
        .then(refreshState),
    )

    it('fills balanced outputs with LP Max and preserves edits until the next LP change', () => {
      mountWithdraw()
      withdrawLpInput().find('[data-testid="input-chip-Max"]').click()
      withdrawLpInput().find('input').should('have.value', state.lp.balance)
      state.coins.map(({ address, decimals }, index) =>
        poolInput(address)
          .find('input')
          .should(input =>
            expect(+input.val()!).to.be.closeTo(
              (+state.reserves[index] * +state.lp.balance) / +state.supply,
              10 ** -decimals,
            ),
          ),
      )
      checkWithdrawDetail('expected-lp', state.lp.balance)
      checkWithdrawDetail('maximum-lp', state.lp.balance)
      checkWithdrawDetail('projected-lp', '0')
      const coinIndex = oneInt(state.coins.length)
      const { address, decimals } = state.coins[coinIndex]
      const balancedOutput = (+state.reserves[coinIndex] * +state.lp.balance) / +state.supply
      const editedAmount = oneDecimal(balancedOutput * 0.1, balancedOutput * 0.2, decimals)
      readPoolAmounts(state.coins).then(amounts => {
        writePoolAmount(address, editedAmount)
        state.coins.map((coin, index) =>
          poolInput(coin.address)
            .find('input')
            .should('have.value', coin.address === address ? editedAmount : amounts[index]),
        )
      })
      withdrawLpInput().find('input').should('have.value', state.lp.balance)
      withdrawSubmit().should('be.enabled')
      // LP Max must restore balanced mode even though the LP amount is already at Max.
      withdrawLpInput().find('[data-testid="input-chip-Max"]').click()
      checkWithdrawDetail('expected-lp', state.lp.balance)
      checkWithdrawDetail('projected-lp', '0')
      writeWithdrawLp(oneDecimal(+state.lp.balance * 0.4, +state.lp.balance * 0.6, state.lp.decimals))
      poolInput(address).find('input').should('not.have.value', editedAmount)
    })

    it('rejects invalid amounts and withdraws corrected amounts', () => {
      const coin = oneOf(...state.coins)
      const lpBudget = oneDecimal(+state.lp.balance * 0.1, +state.lp.balance * 0.2, state.lp.decimals)
      const overBudgetOutput = oneDecimal(+lpBudget * 2, +lpBudget * 3, coin.decimals)
      const correctedOutput = oneDecimal(+lpBudget * 0.1, +lpBudget * 0.2, coin.decimals)
      mountWithdraw()

      // Sample one invalid LP amount before correcting it for the withdrawal.
      withdrawSubmit().should('be.disabled')
      const invalidLp = oneOf<{ amount: Decimal; message: string }>(
        { amount: '0', message: 'Enter an LP amount' },
        { amount: decimalSum(state.lp.balance, oneDecimal(1, 10)), message: 'Insufficient LP balance' },
      )
      writeWithdrawLp(invalidLp.amount)
      withdrawLpInput().find('[data-testid="helper-message-error"]').should('contain.text', invalidLp.message)
      withdrawSubmit().should('be.disabled')

      // Output validation: zero, above the token maximum, and above the LP budget.
      writeWithdrawLp(lpBudget)
      state.coins.forEach(({ address }) => writePoolAmount(address, '0'))
      cy.get('[data-testid="loan-form-error-root"]').should('contain.text', 'Enter an amount to withdraw')
      withdrawSubmit().should('be.disabled')

      writePoolAmount(coin.address, decimalSum(state.reserves[state.coins.indexOf(coin)], oneDecimal(1, 10)))
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
      writePoolAmount(coin.address, correctedOutput)
      withdrawLpInput().find('[data-testid="helper-message-error"]').should('not.exist')
      state.coins.map(({ address }) =>
        poolInput(address).find('[data-testid="helper-message-error"]').should('not.exist'),
      )
      cy.get('[data-testid="loan-form-error-root"]').should('not.exist')
      checkPartialWithdrawQuote(state, lpBudget)
      checkEstimatedTxCost({ category: 'stellar.simulation' })
      submitWithdrawAndCheck(state)
    })

    it('withdraws the full LP balance into one coin without leaving LP dust', () => {
      const coin = oneOf(...state.coins)
      cy.log(`Withdraw Max into ${coin.symbol}`)
      mountWithdraw()
      selectWithdrawMax(state, coin)
      writePoolAmount(coin.address, oneDecimal(+state.lp.balance * 0.01, +state.lp.balance * 0.05, coin.decimals))
      withdrawLpInput().find('input').should('have.value', state.lp.balance)
      checkPartialWithdrawQuote(state, state.lp.balance)
      selectWithdrawMax(state, coin)
      submitWithdrawAndCheck(state)
    })
  })

  describe('balanced withdrawal', () => {
    beforeEach(() => cy.then(TIMEOUTS['stellar.seedPool'], () => seedTestPool(pool, testnetConfig)).then(refreshState))

    it('withdraws the selected LP amount independently of slippage', () => {
      mountWithdraw()
      const lpAmount = oneOf(
        state.lp.balance,
        oneDecimal(+state.lp.balance * 0.1, +state.lp.balance * 0.9, state.lp.decimals),
      )
      const remainingLp = decimalMinus(state.lp.balance, lpAmount)
      cy.log(`Withdraw balanced ${lpAmount} LP; remaining ${remainingLp}`)
      if (lpAmount === state.lp.balance) withdrawLpInput().find('[data-testid="input-chip-Max"]').click()
      else writeWithdrawLp(lpAmount)
      checkWithdrawDetail('expected-lp', lpAmount)
      readPoolAmounts(state.coins).then(amounts => {
        cy.get('[data-testid="slippage-settings-button"]').click()
        cy.get('[data-testid="slippage-input"]').find('input').clear()
        cy.get('[data-testid="slippage-input"]')
          .find('input')
          .type(oneDecimal(+SLIPPAGE.stable.presets[1], +SLIPPAGE.stable.max))
        cy.get('[data-testid="slippage-save-button"]').click()
        state.coins.map(({ address }, index) => poolInput(address).find('input').should('have.value', amounts[index]))
        checkWithdrawDetail('expected-lp', lpAmount)
        checkWithdrawDetail('maximum-lp', lpAmount)
        checkWithdrawDetail('projected-lp', remainingLp)
        submitWithdrawAndCheck(state)
        withdrawLpInput().find('[data-testid="balance-value"]').should('have.attr', 'data-value', remainingLp)
      })
    })
  })
})
