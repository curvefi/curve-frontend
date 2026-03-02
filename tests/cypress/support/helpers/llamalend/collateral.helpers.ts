import { LOAD_TIMEOUT, TRANSACTION_LOAD_TIMEOUT } from '@cy/support/ui'
import type { Decimal } from '@primitives/decimal.utils'
import { formatNumber } from '@ui-kit/utils'
import { getActionValue, touchInput } from './action-info.helpers'

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
  touchInput(() => getCollateralInput(testId))

export const checkCurrentCollateral = (expected: Decimal) => {
  const formatted = formatNumber(expected, { abbreviate: false })
  getActionValue('borrow-collateral').should('equal', formatted)
  getActionValue('borrow-collateral', 'previous').should('equal', formatted)
}
