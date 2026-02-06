import { notFalsy } from '@curvefi/prices-api/objects.util'
import type { Decimal } from '@ui-kit/utils'
import { LOAD_TIMEOUT, TRANSACTION_LOAD_TIMEOUT } from '../ui'

const getRepayInput = () => cy.get('[data-testid^="repay-input-"] input[type="text"]', LOAD_TIMEOUT).first()

const getActionValue = (name: string, field?: 'previous') =>
  cy.get(`[data-testid="${notFalsy(name, field, 'value').join('-')}"]`, LOAD_TIMEOUT)

export function selectRepayToken(symbol: string) {
  cy.get('body').then((body) => {
    const selector = '[data-testid^="repay-input-"] [role="button"][aria-haspopup="listbox"]'
    if (body.find(selector).length) {
      cy.get(selector, LOAD_TIMEOUT).click()
      cy.get(`[data-testid="token-option-${symbol}"]`, LOAD_TIMEOUT).click()
    }
  })
}

export function writeRepayLoanForm({ amount }: { amount: Decimal }) {
  getRepayInput().clear().type(amount)
  cy.get('[data-testid="loan-info-accordion"] button', LOAD_TIMEOUT).first().click() // open the accordion
}

export function checkRepayDetailsLoaded({
  leverageEnabled,
  debt: [expectedFutureDebt, expectedCurrentDebt, expectedSymbol],
}: {
  debt: [Decimal, Decimal, string]
  leverageEnabled: boolean
}) {
  if (leverageEnabled) {
    getActionValue('borrow-band-range')
      .invoke(LOAD_TIMEOUT, 'text')
      .should('match', /(\d(\.\d+)?) to (-?\d(\.\d+)?)/)
  } else {
    getActionValue('borrow-band-range').should('not.exist')
  }
  getActionValue('borrow-price-range')
    .invoke(LOAD_TIMEOUT, 'text')
    .should('match', /(\d(\.\d+)?) - (\d(\.\d+)?)/)
  getActionValue('borrow-apr').contains('%')
  getActionValue('borrow-debt')
    .invoke(LOAD_TIMEOUT, 'text')
    .should('equal', expectedFutureDebt + expectedSymbol)
  getActionValue('borrow-debt', 'previous').invoke(LOAD_TIMEOUT, 'text').should('equal', expectedCurrentDebt)
  cy.get('[data-testid="loan-form-errors"]').should('not.exist')
}

export const checkDebt = (expectedPreviousDebt: Decimal, expectedCurrentDebt: Decimal, expectedSymbol: string) => {
  getActionValue('borrow-debt')
    .invoke(LOAD_TIMEOUT, 'text')
    .should('equal', expectedCurrentDebt + expectedSymbol)
  getActionValue('borrow-debt', 'previous').should('equal', expectedPreviousDebt)
}

export function submitRepayForm() {
  cy.get('[data-testid="repay-submit-button"]', LOAD_TIMEOUT).click()
  return cy
    .get('[data-testid="toast-success"]', TRANSACTION_LOAD_TIMEOUT)
    .contains('Loan repaid', TRANSACTION_LOAD_TIMEOUT)
}
