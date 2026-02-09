import { LOAD_TIMEOUT, TRANSACTION_LOAD_TIMEOUT } from '@cy/support/ui'
import { type Decimal } from '@ui-kit/utils'
import { checkDebt, getActionValue } from './action-info.helpers'

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
    cy.get('body').find('[data-testid="borrow-band-range-value"]').should('not.exist')
  }
  getActionValue('borrow-price-range').should('match', /(\d(\.\d+)?) - (\d(\.\d+)?)/)
  getActionValue('borrow-apr').should('include', '%')
  checkDebt(...debt)
  cy.get('[data-testid="loan-form-errors"]').should('not.exist')
}

export function submitRepayForm() {
  cy.get('[data-testid="repay-submit-button"]', LOAD_TIMEOUT).click()
  return cy
    .get('[data-testid="toast-success"]', TRANSACTION_LOAD_TIMEOUT)
    .contains('Loan repaid', TRANSACTION_LOAD_TIMEOUT)
}
