import { disconnect, getConnection } from 'wagmi/actions'
import { AdvancedWithdrawTab } from '@/dex/features/withdraw/components/AdvancedWithdrawTab'
import { OneCoinWithdrawTab } from '@/dex/features/withdraw/components/OneCoinWithdrawTab'
import { MockPoolTestWrapper } from '@cy/support/helpers/dex/MockPoolTestWrapper'
import { createWithdrawScenario } from '@cy/support/helpers/dex/mocks/withdraw.mocks'
import { setupMockedPoolComponentTest } from '@cy/support/helpers/dex/test-context.helpers'
import {
  checkPoolWithdrawDetail,
  poolWithdrawInput,
  poolWithdrawLpInput,
  poolWithdrawSubmit,
  selectPoolWithdrawCoin,
  selectPoolWithdrawMax,
  submitPoolWithdraw,
  writePoolWithdrawAmount,
  writePoolWithdrawLp,
} from '@cy/support/helpers/dex/withdraw.helpers'
import { checkEstimatedTxCost, getActionValue } from '@cy/support/helpers/llamalend/action-info.helpers'
import { mockedWagmiConfig } from '@cy/support/helpers/llamalend/test-wagmi.helpers'
import { formatNumber } from '@primitives/number.utils'
import { formatToken } from '@ui/lib/tokens'

const mountWithdraw = ({ curve, pool }: ReturnType<typeof createWithdrawScenario>, advanced = false) => {
  if (!curve.signerAddress) cy.then(() => disconnect(mockedWagmiConfig))
  const Tab = advanced ? AdvancedWithdrawTab : OneCoinWithdrawTab
  return cy.mount(
    <MockPoolTestWrapper curve={curve} pool={pool}>
      <Tab maxSlippage="0.5" />
    </MockPoolTestWrapper>,
  )
}

const checkPriceImpact = () =>
  getActionValue('pool-price-impact', 'mock.simulation').should('equal', formatNumber('0', 'percent.price-impact'))

const checkNoValidationErrors = () =>
  cy.get('[data-testid="helper-message-error"], [data-testid="loan-form-errors"]').should('not.exist')

describe('Pool Withdraw (mocked)', () => {
  beforeEach(setupMockedPoolComponentTest)

  ;[true, false].forEach(approved => {
    it(approved ? 'fills and submits (already approved)' : 'fills, approves, and submits', () => {
      const scenario = createWithdrawScenario({ approved })
      const { coins, assertPreSubmit, assertSubmit } = scenario
      mountWithdraw(scenario)
      writePoolWithdrawAmount(coins[0].address, '1.25')
      poolWithdrawSubmit().should('be.enabled')
      checkPoolWithdrawDetail('projected-lp', '8.75')
      checkEstimatedTxCost({ category: 'mock.simulation' })
      cy.then(() => assertPreSubmit())
      submitPoolWithdraw(true).then(() => assertSubmit())
      poolWithdrawInput(coins[0].address).find('input[name="amount"]').should('have.value', '')
      poolWithdrawSubmit().should('be.disabled')
    })
  })

  it('keeps the entered amount while its quote loads and blocks submission until it resolves', () => {
    const scenario = createWithdrawScenario({ delayQuote: true })
    const { coins, quote, withdraw, releaseQuote, assertSubmit } = scenario
    mountWithdraw(scenario)
    writePoolWithdrawAmount(coins[0].address, '1.25')
    cy.wrap(null).should(() => expect(quote).to.have.been.called)
    poolWithdrawInput(coins[0].address).find('input[name="amount"]').should('have.attr', 'data-value', '1.25')
    checkNoValidationErrors()
    poolWithdrawSubmit().should('be.disabled')
    poolWithdrawInput(coins[0].address).closest('form').submit()
    cy.then(() => expect(withdraw.callCount).to.equal(0))
    cy.then(releaseQuote)
    poolWithdrawSubmit().should('be.enabled')
    submitPoolWithdraw(true).then(() => assertSubmit())
  })

  it('validates token precision, reserves and LP balance, then accepts a corrected amount', () => {
    const scenario = createWithdrawScenario()
    const { coins } = scenario
    mountWithdraw(scenario)
    writePoolWithdrawAmount(coins[0].address, '0.0000001')
    poolWithdrawInput(coins[0].address)
      .find('[data-testid="helper-message-error"]')
      .should('contain.text', 'Amount exceeds token decimal precision')
    poolWithdrawSubmit().should('be.disabled')
    writePoolWithdrawAmount(coins[0].address, '101')
    poolWithdrawInput(coins[0].address)
      .find('[data-testid="helper-message-error"]')
      .should('contain.text', 'Amount exceeds the maximum withdrawal')
    poolWithdrawSubmit().should('be.disabled')
    writePoolWithdrawAmount(coins[0].address, '11')
    poolWithdrawInput(coins[0].address)
      .find('[data-testid="helper-message-error"]')
      .should('contain.text', 'Maximum LP required exceeds')
    cy.get('[data-testid="loan-form-errors"]').should('not.exist')
    getActionValue('pool-minimum-received', 'mock.simulation').should(
      'equal',
      `~${formatToken('10.945', coins[0].symbol, 'balance')}`,
    )
    checkPoolWithdrawDetail('projected-lp', '-1')
    checkPriceImpact()
    poolWithdrawSubmit().should('be.disabled')
    writePoolWithdrawAmount(coins[0].address, '1.25')
    poolWithdrawSubmit().should('be.enabled')
    checkNoValidationErrors()
  })

  it('clears the amount on token changes and uses the full LP balance for Max', () => {
    const scenario = createWithdrawScenario()
    const { coins, assertPreSubmit, assertSubmit } = scenario
    mountWithdraw(scenario)
    selectPoolWithdrawMax(coins[0].address)
    selectPoolWithdrawCoin(coins[1].address)
    poolWithdrawInput(coins[1].address).find('input[name="amount"]').should('have.value', '')
    checkNoValidationErrors()
    poolWithdrawSubmit().should('be.disabled')
    selectPoolWithdrawMax(coins[1].address)
    poolWithdrawSubmit().should('be.enabled')
    checkEstimatedTxCost({ category: 'mock.simulation' })
    cy.then(() => assertPreSubmit('10', 1))
    submitPoolWithdraw(true).then(() => assertSubmit('10', 1))
  })

  it('blocks submission when the quoted price impact is too high', () => {
    const scenario = createWithdrawScenario({ bonus: '-99' })
    const { coins, withdraw } = scenario
    mountWithdraw(scenario)
    writePoolWithdrawAmount(coins[0].address, '1.25')
    cy.get('[data-testid="high-price-impact-alert"]').should('be.visible')
    poolWithdrawSubmit().should('be.disabled')
    poolWithdrawInput(coins[0].address).closest('form').submit()
    cy.then(() => expect(withdraw.callCount).to.equal(0))
  })

  it('clears the amount when switching to wrapped withdrawals and submits without approval', () => {
    const scenario = createWithdrawScenario({ wrapped: true, approved: false })
    const { coins, assertPreSubmit, assertSubmit } = scenario
    mountWithdraw(scenario)
    writePoolWithdrawAmount(coins[0].address, '1.25')
    cy.get('[data-testid="pool-withdraw-wrapped-checkbox"] input').check().should('be.checked')
    poolWithdrawInput(coins[0].address).find('input[name="amount"]').should('have.value', '')
    writePoolWithdrawAmount(coins[0].address, '1.25')
    poolWithdrawSubmit().should('be.enabled')
    checkEstimatedTxCost({ category: 'mock.simulation' })
    cy.then(() => assertPreSubmit())
    submitPoolWithdraw(true).then(() => assertSubmit())
  })

  ;(['one-coin', 'balanced', 'unbalanced'] as const).forEach(mode => {
    ;[false, true].forEach(connected => {
      it(`quotes ${mode} withdrawals while ${connected ? 'the LP balance is zero' : 'disconnected'}`, () => {
        const scenario = createWithdrawScenario({ mode, connected, lpBalance: '0' })
        const { coins, withdraw, approve } = scenario
        mountWithdraw(scenario, mode !== 'one-coin')
        if (mode === 'balanced') {
          writePoolWithdrawLp('2.5')
          coins.forEach(({ address }) => {
            poolWithdrawInput(address).find('input[name^="amount"]').should('have.attr', 'data-value', '0.25')
          })
        } else if (mode === 'unbalanced') {
          cy.get('[data-testid="withdraw-unbalanced-checkbox"] input').check()
          writePoolWithdrawAmount(coins[0].address, '0.2')
          writePoolWithdrawAmount(coins[1].address, '0.3')
          getActionValue('pool-withdraw-maximum-lp', 'mock.simulation').should(
            'equal',
            formatNumber('2.5125', 'token.balance'),
          )
        } else {
          writePoolWithdrawAmount(coins[0].address, '1.25')
          getActionValue('pool-minimum-received', 'mock.simulation').should(
            'equal',
            `~${formatToken('1.24375', coins[0].symbol, 'balance')}`,
          )
        }
        checkPriceImpact()
        if (connected) {
          checkPoolWithdrawDetail('current-lp', '0')
          checkPoolWithdrawDetail('projected-lp', mode === 'one-coin' ? '-1.25' : '-2.5')
          poolWithdrawSubmit().should('be.disabled')
        } else {
          cy.get('[data-testid="pool-withdraw-connect-wallet"]').should('be.visible')
          poolWithdrawSubmit().should('not.exist')
          cy.then(() => expect(getConnection(mockedWagmiConfig).status).to.equal('disconnected'))
        }
        poolWithdrawInput(coins[0].address).closest('form').submit()
        cy.then(() => {
          expect(approve.callCount).to.equal(0)
          expect(withdraw.callCount).to.equal(0)
        })
      })
    })
  })

  it('validates balanced LP amounts, synchronizes outputs, and submits Max', () => {
    const scenario = createWithdrawScenario({ mode: 'balanced', approved: false })
    const { coins, assertPreSubmit, assertSubmit } = scenario
    mountWithdraw(scenario, true)
    ;(
      [
        ['0', 'Enter a valid LP amount'],
        ['11', 'Insufficient LP balance'],
      ] as const
    ).forEach(([amount, message]) => {
      writePoolWithdrawLp(amount)
      poolWithdrawLpInput().find('[data-testid="helper-message-error"]').should('contain.text', message)
      poolWithdrawSubmit().should('be.disabled')
    })
    cy.get('[data-testid="loan-form-errors"]').should('not.exist')
    writePoolWithdrawAmount(coins[0].address, '0.5')
    poolWithdrawLpInput().find('input').should('have.attr', 'data-value', '5')
    poolWithdrawInput(coins[1].address).find('input[name^="amount"]').should('have.attr', 'data-value', '0.5')
    poolWithdrawLpInput().find('[data-testid="input-chip-Max"]').click()
    coins.forEach(({ address }) => {
      poolWithdrawInput(address).find('input[name^="amount"]').should('have.attr', 'data-value', '1')
    })
    checkPoolWithdrawDetail('projected-lp', '0')
    poolWithdrawSubmit().should('be.enabled')
    checkNoValidationErrors()
    checkEstimatedTxCost({ category: 'mock.simulation' })
    cy.then(() => assertPreSubmit('10'))
    submitPoolWithdraw(true).then(() => assertSubmit('10'))
  })

  it('keeps custom outputs independent, validates reserves and LP burn, and submits corrected amounts', () => {
    const scenario = createWithdrawScenario({ mode: 'unbalanced', approved: false })
    const { coins, assertPreSubmit, assertSubmit } = scenario
    mountWithdraw(scenario, true)
    cy.get('[data-testid="withdraw-unbalanced-checkbox"] input').check()
    poolWithdrawLpInput().should('not.exist')
    writePoolWithdrawAmount(coins[1].address, '0.3')
    writePoolWithdrawAmount(coins[0].address, '101')
    poolWithdrawInput(coins[0].address)
      .find('[data-testid="helper-message-error"]')
      .should('contain.text', 'Amount exceeds the maximum withdrawal')
    poolWithdrawSubmit().should('be.disabled')
    writePoolWithdrawAmount(coins[0].address, '1.7')
    poolWithdrawInput(coins[1].address).find('input[name^="amount"]').should('have.attr', 'data-value', '0.3')
    cy.get('[data-testid="loan-form-errors"]').should('contain.text', 'Maximum LP required exceeds')
    getActionValue('pool-withdraw-maximum-lp', 'mock.simulation').should(
      'equal',
      formatNumber('10.05', 'token.balance'),
    )
    poolWithdrawSubmit().should('be.disabled')
    writePoolWithdrawAmount(coins[0].address, '0.2')
    poolWithdrawSubmit().should('be.enabled')
    checkNoValidationErrors()
    checkPoolWithdrawDetail('projected-lp', '7.5')
    checkEstimatedTxCost({ category: 'mock.simulation' })
    cy.then(() => assertPreSubmit(['0.2', '0.3']))
    submitPoolWithdraw(true).then(() => assertSubmit(['0.2', '0.3']))
  })
})
