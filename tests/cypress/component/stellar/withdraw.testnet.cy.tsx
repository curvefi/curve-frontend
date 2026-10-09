import type { StellarContract } from '@/stellar/features/connect-wallet/address'
import { DepositTab } from '@/stellar/features/deposit/DepositTab'
import { WithdrawTab } from '@/stellar/features/withdraw/WithdrawTab'
import { checkEstimatedTxCost } from '@cy/support/helpers/llamalend/action-info.helpers'
import { connectTestWallet, deployTestPool } from '@cy/support/helpers/stellar/connector'
import { allCoinDeposit, submitDepositForm } from '@cy/support/helpers/stellar/deposit.helpers'
import {
  readPoolAmounts,
  poolInput,
  TEST_NETWORK,
  writePoolAmount,
  writePoolForm,
  checkPoolInputError,
} from '@cy/support/helpers/stellar/pool.helpers'
import { getTestnetConfig, type TestnetConfig } from '@cy/support/helpers/stellar/stellar-testnet.config'
import { StellarTestWrapper } from '@cy/support/helpers/stellar/StellarTestWrapper'
import {
  checkWithdrawBalances,
  checkWithdrawDetail,
  checkWithdrawResult,
  fetchWithdrawPreview,
  fetchWithdrawState,
  submitWithdrawForm,
  withdrawLpInput,
  withdrawSubmit,
  type WithdrawState,
  writeWithdrawLp,
} from '@cy/support/helpers/stellar/withdraw.helpers'
import { TIMEOUTS } from '@cy/support/timeout-categories'
import { skipTestsAfterFailure } from '@cy/support/ui'
import type { Decimal } from '@primitives/decimal.utils'
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
        <WithdrawTab network={TEST_NETWORK} pool={pool} />
      </StellarTestWrapper>,
    )
    if (connected) checkWithdrawBalances(state)
  }

  it('disables withdrawals from an unseeded pool', () => {
    expect(state.supply).to.equal('0')
    mountWithdraw()
    withdrawLpInput().find('input').should('be.disabled')
    withdrawSubmit().should('be.disabled')
  })

  describe('seeded pool', () => {
    beforeEach(() => {
      if (+state.supply) return

      cy.mount(
        <StellarTestWrapper address={testnetConfig.deployer.address}>
          <DepositTab network={TEST_NETWORK} pool={pool} />
        </StellarTestWrapper>,
      )
      writePoolForm(state.coins, allCoinDeposit(state.coins))
      submitDepositForm(state)
      cy.then(TIMEOUTS['stellar.read'], () => fetchWithdrawState(pool, testnetConfig)).then(fresh => {
        expect(+fresh.lp.balance).to.be.greaterThan(0)
        state = fresh
      })
    })

    it('requires a connected wallet', () => {
      mountWithdraw({ connected: false })
      state.coins.map(({ address }) => poolInput(address).should('be.visible'))
      cy.get('[data-testid="pool-withdraw-connect-wallet"]', TIMEOUTS['ui.render']).should('be.enabled')
      withdrawSubmit().should('not.exist')
    })

    it('rejects empty, zero and excessive LP amounts', () => {
      mountWithdraw()
      withdrawSubmit().should('be.disabled')
      ;[
        { amount: '0' as Decimal, message: 'Enter an LP amount' },
        { amount: decimalSum(state.lp.balance, '1'), message: 'Insufficient LP balance' },
      ].forEach(({ amount, message }) => {
        writeWithdrawLp(amount)
        withdrawLpInput().find('[data-testid="helper-message-error"]').should('contain.text', message)
        withdrawSubmit().should('be.disabled')
        writeWithdrawLp(WITHDRAW_LP_AMOUNT)
        withdrawLpInput().find('[data-testid="helper-message-error"]').should('not.exist')
        withdrawSubmit().should('be.enabled')
      })
    })

    it('fills balanced outputs with LP Max and preserves edits until the next LP change', () => {
      mountWithdraw()
      withdrawLpInput().find('[data-testid="input-chip-Max"]').click()
      withdrawLpInput().find('input').should('have.value', state.lp.balance)
      const slippage = +useUserProfileStore.getState().maxSlippage.stable
      state.coins.map(({ address, decimals }, index) =>
        poolInput(address)
          .find('input')
          .should(input => {
            const expected = (+state.reserves[index] * +state.lp.balance) / +state.supply / (1 + slippage / 100)
            expect(+input.val()!).to.be.closeTo(expected, 10 ** -decimals)
          }),
      )
      writePoolAmount(state.coins[0].address, SINGLE_COIN_OUTPUT_AMOUNT)
      withdrawLpInput().find('input').should('have.value', state.lp.balance)
      withdrawSubmit().should('be.enabled')
      poolInput(state.coins[0].address).find('input').should('have.value', SINGLE_COIN_OUTPUT_AMOUNT)
      writeWithdrawLp(WITHDRAW_LP_AMOUNT)
      poolInput(state.coins[0].address).find('input').should('not.have.value', SINGLE_COIN_OUTPUT_AMOUNT)
    })

    it('selects one coin at Max, clears the others, and allows smaller amounts', () => {
      mountWithdraw()
      writeWithdrawLp(WITHDRAW_LP_AMOUNT)
      state.coins.forEach(({ address }, index) => {
        poolInput(address)
          .find('[data-testid="balance-value"]')
          .invoke('attr', 'data-value')
          .then(maxAmount => {
            poolInput(address).find('[data-testid="input-chip-Max"]').click()
            state.coins.map(({ address }, i) =>
              poolInput(address)
                .find('input')
                .should('have.value', i === index ? maxAmount : '0'),
            )
          })
        withdrawLpInput().find('input').should('have.value', state.lp.balance)
        poolInput(address).find('[data-testid="helper-message-error"]').should('not.exist')
        checkWithdrawDetail('expected-lp', state.lp.balance)
        checkWithdrawDetail('maximum-lp', state.lp.balance)
        checkWithdrawDetail('projected-lp', '0')
        cy.get('[data-testid="loan-form-error-root"]').should('not.exist')
      })
      const { address } = state.coins.at(-1)!
      writePoolAmount(address, SINGLE_COIN_OUTPUT_AMOUNT)
      withdrawSubmit().should('be.enabled')
      poolInput(address).find('input').should('have.value', SINGLE_COIN_OUTPUT_AMOUNT)
      withdrawLpInput().find('input').should('have.value', state.lp.balance)
      state.coins.slice(0, -1).map(({ address }) => poolInput(address).find('input').should('have.value', '0'))
      poolInput(address).find('[data-testid="helper-message-error"]').should('not.exist')
      cy.get('[data-testid="loan-form-error-root"]').should('not.exist')
    })

    it('rejects zero outputs, amounts above the user maximum and outputs above the LP budget', () => {
      const lpBudget = '0.001' satisfies Decimal
      const overBudgetOutput = '0.003' satisfies Decimal
      mountWithdraw()
      writeWithdrawLp(lpBudget)
      state.coins.forEach(({ address }) => writePoolAmount(address, '0'))
      withdrawSubmit().should('be.disabled')
      state.coins.forEach(({ address }, index) => {
        writePoolAmount(address, decimalSum(state.reserves[index], '1'))
        checkPoolInputError(address, 'Amount exceeds the maximum withdrawal')
        withdrawSubmit().should('be.disabled')
        writePoolAmount(address, '0')
      })
      writePoolAmount(state.coins[0].address, overBudgetOutput)
      cy.get('[data-testid="loan-form-error-root"]', TIMEOUTS['ui.render']).should(
        'contain.text',
        'Maximum LP required exceeds the LP amount',
      )
      withdrawSubmit().should('be.disabled')
      poolInput(state.coins[0].address).find('input').should('have.value', overBudgetOutput)
      writePoolAmount(state.coins[0].address, SINGLE_COIN_OUTPUT_AMOUNT)
      state.coins.map(({ address }) =>
        poolInput(address).find('[data-testid="helper-message-error"]').should('not.exist'),
      )
      cy.get('[data-testid="loan-form-error-root"]').should('not.exist')
      withdrawSubmit().should('be.enabled')
    })

    ;[
      { label: 'balanced outputs', singleCoin: false },
      { label: 'a single coin', singleCoin: true },
    ].forEach(({ label, singleCoin }) => {
      it(`withdraws ${label} and refreshes balances and supply`, () => {
        mountWithdraw()
        writeWithdrawLp(WITHDRAW_LP_AMOUNT)
        readPoolAmounts(state.coins).then(() => {
          if (singleCoin) {
            state.coins.forEach(({ address }, index) =>
              writePoolAmount(address, index === 0 ? SINGLE_COIN_OUTPUT_AMOUNT : '0'),
            )
          }
        })
        withdrawSubmit().should('be.enabled')
        readPoolAmounts(state.coins).then(amounts =>
          cy
            .then(TIMEOUTS['stellar.simulation'], () => fetchWithdrawPreview(pool, state, amounts))
            .then(({ expected, maximum, projected }) => {
              checkWithdrawDetail('expected-lp', expected)
              checkWithdrawDetail('maximum-lp', maximum)
              checkWithdrawDetail('projected-lp', projected)
              expect(+maximum).to.be.at.most(+WITHDRAW_LP_AMOUNT)
              checkEstimatedTxCost({ category: 'stellar.simulation' })
              submitWithdrawForm(state)
              checkWithdrawDetail('current-lp', projected)
              cy.then(TIMEOUTS['stellar.read'], () => fetchWithdrawState(pool, testnetConfig)).then(fresh => {
                checkWithdrawResult(state, fresh, amounts, expected, projected)
              })
            }),
        )
      })
    })
  })
})
