import { LOAD_TIMEOUT, TRANSACTION_LOAD_TIMEOUT } from '@cy/support/ui'
import { type Decimal } from '@ui-kit/utils'
import { checkDebt, getActionValue } from './action-info.helpers'

const getRepayInput = () => cy.get('[data-testid^="repay-input-"] input[type="text"]', LOAD_TIMEOUT).first()

export function selectRepayToken({
  symbol,
  tokenAddress,
  hasLeverage,
}: {
  symbol: string
  tokenAddress: string
  hasLeverage: boolean
}) {
  if (!hasLeverage) {
    return cy.get(`[data-testid="token-icon-${tokenAddress.toLowerCase()}"]`, LOAD_TIMEOUT).should('be.visible')
  }
  cy.get('[data-testid^="repay-input-"] [aria-haspopup="listbox"]', LOAD_TIMEOUT).click()
  cy.get(`[data-testid="token-option-${symbol}"]`, LOAD_TIMEOUT).click()
  cy.get(`[data-testid="token-icon-${tokenAddress.toLowerCase()}"]`, LOAD_TIMEOUT).should('be.visible')
}

export function writeRepayLoanForm({ amount }: { amount: Decimal }) {
  getRepayInput().clear().type(amount)
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
    cy.get('[data-testid="borrow-band-range-value"]').should('not.exist')
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
