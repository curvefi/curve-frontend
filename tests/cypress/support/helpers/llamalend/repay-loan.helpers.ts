import { LOAD_TIMEOUT, TRANSACTION_LOAD_TIMEOUT } from '@cy/support/ui'
import type { Decimal } from '@ui-kit/utils'
import { getActionValue } from './action-info.helpers'

const getRepayInput = () => cy.get('[data-testid^="repay-input-"] input[type="text"]', LOAD_TIMEOUT).first()

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

export const checkDebt = (current: Decimal, future: Decimal, symbol: string) => {
  getActionValue('borrow-debt').should('eq', future)
  cy.get('[data-testid="borrow-debt-value"]', LOAD_TIMEOUT).contains(symbol)
  getActionValue('borrow-debt', 'previous').should('eq', current)
}

export function checkRepayDetailsLoaded({
  leverageEnabled,
  debt,
}: {
  debt: Parameters<typeof checkDebt>
  leverageEnabled: boolean
}) {
  if (leverageEnabled) {
    getActionValue('borrow-band-range').should('match', /(\d(\.\d+)?) to (-?\d(\.\d+)?)/)
  } else {
    getActionValue('borrow-band-range').should('not.exist')
  }
  getActionValue('borrow-price-range').should('match', /(\d(\.\d+)?) - (\d(\.\d+)?)/)
  getActionValue('borrow-apr').should('include', '%')
  checkDebt(...debt)
  cy.get('[data-testid="loan-form-errors"]').should('not.exist')
}

export function submitRepayForm() {
  cy.get('[data-testid="repay-submit-button"]', LOAD_TIMEOUT).as('repaySubmit')
  cy.get('@repaySubmit').should('not.be.disabled')
  cy.get('@repaySubmit').click()
  return cy
    .get('[data-testid="toast-success"]', TRANSACTION_LOAD_TIMEOUT)
    .contains('Loan repaid', TRANSACTION_LOAD_TIMEOUT)
}
