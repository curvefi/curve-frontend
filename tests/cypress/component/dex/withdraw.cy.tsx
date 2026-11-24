import { OneCoinWithdrawTab } from '@/dex/features/withdraw/components/OneCoinWithdrawTab'
import { MockPoolTestWrapper } from '@cy/support/helpers/dex/MockPoolTestWrapper'
import { createWithdrawScenario } from '@cy/support/helpers/dex/mocks/withdraw.mocks'
import { setupMockedPoolComponentTest } from '@cy/support/helpers/dex/test-context.helpers'
import {
  checkPoolWithdrawDetail,
  poolWithdrawInput,
  poolWithdrawSubmit,
  selectPoolWithdrawCoin,
  selectPoolWithdrawMax,
  submitPoolWithdraw,
  writePoolWithdrawAmount,
} from '@cy/support/helpers/dex/withdraw.helpers'
import { checkEstimatedTxCost } from '@cy/support/helpers/llamalend/action-info.helpers'

const mountWithdraw = ({ curve, pool }: ReturnType<typeof createWithdrawScenario>) =>
  cy.mount(
    <MockPoolTestWrapper curve={curve} pool={pool}>
      <OneCoinWithdrawTab maxSlippage="0.5" />
    </MockPoolTestWrapper>,
  )

describe('OneCoinWithdrawForm (mocked)', () => {
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
    poolWithdrawInput(coins[0].address).find('[data-testid="helper-message-error"]').should('not.exist')
    cy.get('[data-testid="loan-form-errors"]').should('not.exist')
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
    cy.get('[data-testid="loan-form-errors"]').should('contain.text', 'Maximum LP required exceeds')
    poolWithdrawSubmit().should('be.disabled')
    writePoolWithdrawAmount(coins[0].address, '1.25')
    poolWithdrawSubmit().should('be.enabled')
    poolWithdrawInput(coins[0].address).find('[data-testid="helper-message-error"]').should('not.exist')
    cy.get('[data-testid="loan-form-errors"]').should('not.exist')
  })

  it('clears the amount on token changes and uses the full LP balance for Max', () => {
    const scenario = createWithdrawScenario()
    const { coins, assertPreSubmit, assertSubmit } = scenario
    mountWithdraw(scenario)
    selectPoolWithdrawMax(coins[0].address)
    selectPoolWithdrawCoin(coins[1].address)
    poolWithdrawInput(coins[1].address).find('input[name="amount"]').should('have.value', '')
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
})
