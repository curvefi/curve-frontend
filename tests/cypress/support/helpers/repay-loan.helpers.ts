import type { Decimal } from '@ui-kit/utils'
import { LOAD_TIMEOUT } from '../ui'

const getRepayInput = () => cy.get('[data-testid^="repay-input-"] input[type="text"]', LOAD_TIMEOUT).first()

const getActionValue = (name: string) => cy.get(`[data-testid="${name}-value"]`, LOAD_TIMEOUT)

export function selectRepayToken(symbol: string) {
  cy.get('[data-testid^="repay-input-"] [role="combobox"]', LOAD_TIMEOUT).click()
  cy.get(`[data-testid="token-option-${symbol}"]`, LOAD_TIMEOUT).click()
}

export function writeRepayLoanForm({ amount }: { amount: Decimal }) {
  getRepayInput().clear().type(amount)
  cy.get('[data-testid="loan-info-accordion"] button', LOAD_TIMEOUT).first().click() // open the accordion
}

export function checkRepayDetailsLoaded({
  hasLeverage,
  expectedDebtInfo,
}: {
  expectedDebtInfo: string
  hasLeverage: boolean
}) {
  if (hasLeverage) {
    getActionValue('borrow-band-range')
      .invoke(LOAD_TIMEOUT, 'text')
      .should('match', /(\d(\.\d+)?) to (-?\d(\.\d+)?)/)
    getActionValue('borrow-price-range')
      .invoke(LOAD_TIMEOUT, 'text')
      .should('match', /(\d(\.\d+)?) - (\d(\.\d+)?)/)
  } else {
    getActionValue('borrow-band-range').should('not.exist')
    getActionValue('borrow-price-range').should('not.exist')
  }
  getActionValue('borrow-apr').contains('%')
  getActionValue('borrow-debt').contains(expectedDebtInfo)
  cy.get('[data-testid="loan-form-errors"]').should('not.exist')
}

export function submitRepayForm() {
  cy.get('[data-testid="repay-submit-button"]').click()
  cy.get('[data-testid="repay-submit-button"]').should('be.disabled')
  cy.get('[data-testid="repay-submit-button"]', LOAD_TIMEOUT)
  return cy.get('[data-testid="repay-submit-button"]')
}
