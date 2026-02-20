import { LOAD_TIMEOUT, TRANSACTION_LOAD_TIMEOUT } from '@cy/support/ui'
import { formatNumber, type Decimal } from '@ui-kit/utils'
import { getActionValue } from './action-info.helpers'

export const getCollateralInput = (testId: 'add-collateral-input' | 'remove-collateral-input') =>
  cy.get(`[data-testid="${testId}"] input[type="text"]`, LOAD_TIMEOUT).first()

export const submitCollateralForm = (buttonTestId: string, message: string) =>
  cy
    .get(`[data-testid="${buttonTestId}"]`, LOAD_TIMEOUT)
    .click()
    .then(() => {
      cy.get('[data-testid="toast-success"]', TRANSACTION_LOAD_TIMEOUT).contains(message, TRANSACTION_LOAD_TIMEOUT)
    })

export const touchCollateralForm = (testId: 'add-collateral-input' | 'remove-collateral-input') =>
  getCollateralInput(testId).type('0.00001').blur().clear().blur()

export const checkCurrentCollateral = (expected: Decimal) => {
  getActionValue('borrow-collateral').should('equal', formatNumber(expected, { abbreviate: false }))
  cy.get('[data-testid="borrow-collateral-previous-value"]').should('not.exist')
}
