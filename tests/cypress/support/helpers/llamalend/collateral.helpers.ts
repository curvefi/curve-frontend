import { submitLoanForm } from '@cy/support/helpers/llamalend/create-loan.helpers'
import { LOAD_TIMEOUT } from '@cy/support/ui'
import type { Decimal } from '@primitives/decimal.utils'
import { formatNumber } from '@ui-kit/utils'
import { getActionValue, touchInput } from './action-info.helpers'

export const getCollateralInput = (testId: 'add-collateral-input' | 'remove-collateral-input') =>
  cy.get(`[data-testid="${testId}"] input[type="text"]`, LOAD_TIMEOUT).first()

export const submitCollateralAddForm = () => submitLoanForm({ form: 'add-collateral', message: 'Collateral added' })

export const submitCollateralRemoveForm = () =>
  submitLoanForm({ form: 'remove-collateral', message: 'Collateral removed' })

export const touchCollateralForm = (testId: 'add-collateral-input' | 'remove-collateral-input') =>
  touchInput(() => getCollateralInput(testId))

export const checkCurrentCollateral = (expected: Decimal) => {
  const formatted = formatNumber(expected, { abbreviate: false })
  getActionValue('borrow-collateral').should('equal', formatted)
  getActionValue('borrow-collateral', 'previous').should('equal', formatted)
}
