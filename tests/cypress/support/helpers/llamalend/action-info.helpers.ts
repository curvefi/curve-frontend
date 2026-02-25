import { notFalsy } from '@curvefi/prices-api/objects.util'
import { LOAD_TIMEOUT, TRANSACTION_LOAD_TIMEOUT } from '@cy/support/ui'
import { type Decimal, formatNumber } from '@ui-kit/utils'

const getActionInfo = (name: string, field?: 'previous') =>
  cy.get(`[data-testid="${notFalsy(name, field, 'value').join('-')}"]`, TRANSACTION_LOAD_TIMEOUT)

export const getActionValue = (name: string, field?: 'previous') =>
  getActionInfo(name, field).invoke(TRANSACTION_LOAD_TIMEOUT, 'attr', 'data-value')

export type DebtCheck = { current: Decimal; future: Decimal; symbol: string }
/**
 * Checks the current and future debt values, and that the symbol is displayed correctly.
 */
export const checkDebt = ({ current, future, symbol }: DebtCheck) => {
  getActionValue('borrow-debt').should('equal', formatNumber(future, { abbreviate: false }))
  cy.get('[data-testid="borrow-debt-value"]', LOAD_TIMEOUT).contains(symbol)
  getActionValue('borrow-debt', 'previous').should('equal', formatNumber(current, { abbreviate: false }))
}

/**
 * Checks that the current debt is as expected, and future value is displayed.
 */
export const checkCurrentDebt = (expectedCurrentDebt: Decimal) => {
  getActionInfo('borrow-debt').should('be.visible')
  const expected = formatNumber(expectedCurrentDebt, { abbreviate: false })
  getActionValue('borrow-debt').should('equal', expected)
  getActionValue('borrow-debt', 'previous').should('equal', expected)
}

export function touchInput(getInputFn: () => Cypress.Chainable) {
  getInputFn().should('have.value', '')
  getInputFn().type('0')
  getInputFn().blur()
}
