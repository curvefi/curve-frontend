import type { Decimal } from '@ui-kit/utils'
import { LOAD_TIMEOUT } from '../ui'

const getRepayInput = () => cy.get('[data-testid^="repay-input-"] input[type="text"]', LOAD_TIMEOUT).first()

const getActionValue = (name: string) => cy.get(`[data-testid="${name}-value"]`, LOAD_TIMEOUT)

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

export function writeRepayLoanFormFromDebt() {
  cy.get('[data-testid="loan-info-accordion"] button', LOAD_TIMEOUT).first().click() // open the accordion
  cy.get('[data-testid="borrow-debt-value"]', LOAD_TIMEOUT)
    .invoke('text')
    .then((text) => {
      const amount = text.replace(/[^0-9.]/g, '').trim()
      if (!amount) throw new Error('Could not parse borrow debt value for repay amount')
      getRepayInput().clear().type(amount)
    })
}

export function checkRepayDetailsLoaded({
  hasLeverage,
  expectedDebtInfo,
}: {
  expectedDebtInfo: string | RegExp
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
  if (expectedDebtInfo instanceof RegExp) {
    getActionValue('borrow-debt').invoke(LOAD_TIMEOUT, 'text').should('match', expectedDebtInfo)
  } else {
    getActionValue('borrow-debt').contains(expectedDebtInfo)
  }
  cy.get('[data-testid="loan-form-errors"]').should('not.exist')
}

export function submitRepayForm() {
  cy.get('[data-testid="repay-submit-button"]').click()
  return cy.get('[data-testid="toast-success"]', LOAD_TIMEOUT).contains('Loan repaid')
}
