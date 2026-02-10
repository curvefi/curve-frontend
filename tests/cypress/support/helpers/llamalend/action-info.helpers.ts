import { notFalsy } from '@curvefi/prices-api/objects.util'
import { LOAD_TIMEOUT } from '@cy/support/ui'
import { type Decimal, formatNumber } from '@ui-kit/utils'

export const getActionValue = (name: string, field?: 'previous') =>
  cy
    .get(`[data-testid="${notFalsy(name, field, 'value').join('-')}"]`, LOAD_TIMEOUT)
    .invoke(LOAD_TIMEOUT, 'attr', 'data-value')

/**
 * Checks the current and future debt values, and that the symbol is displayed correctly.
 */
export const checkDebt = (current: Decimal, future: Decimal, symbol: string) => {
  getActionValue('borrow-debt', undefined).should('equal', formatNumber(future, { abbreviate: false }))
  cy.get('[data-testid="borrow-debt-value"]', LOAD_TIMEOUT).contains(symbol)
  getActionValue('borrow-debt', 'previous').should('equal', formatNumber(current, { abbreviate: false }))
}

/**
 * Checks that the current debt is as expected, and future value is displayed.
 */
export const checkCurrentDebt = (expectedCurrentDebt: Decimal) => {
  getActionValue('borrow-debt', undefined).should('equal', formatNumber(expectedCurrentDebt, { abbreviate: false }))
  cy.get('[data-testid="borrow-debt-previous-value"]').should('not.exist')
}
