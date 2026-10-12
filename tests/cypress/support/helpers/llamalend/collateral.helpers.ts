import { TIMEOUTS, getTimeoutCategory } from '@cy/support/timeout-categories'
import type { Decimal } from '@primitives/decimal.utils'
import { formatNumber } from '@primitives/number.utils'
import { checkEstimatedTxCost, getActionValue, touchInput } from './action-info.helpers'
import { submitLoanForm } from './loan-form.helpers'

export const getCollateralInput = (testId: 'add-collateral-input' | 'remove-collateral-input') =>
  cy.get(`[data-testid="${testId}"] input[type="text"]`, TIMEOUTS['ui.render']).first()

export const submitCollateralAddForm = (isMocked = false) =>
  submitLoanForm({ form: 'add-collateral', message: 'Collateral added', isMocked })

export const submitCollateralRemoveForm = (isMocked = false) =>
  submitLoanForm({ form: 'remove-collateral', message: 'Collateral removed', isMocked })

export const touchCollateralForm = (testId: 'add-collateral-input' | 'remove-collateral-input') =>
  touchInput(() => getCollateralInput(testId))

export const checkCollateralDetailsLoaded = ({
  current,
  future,
  hasApi = true,
  isMocked = false,
}: {
  current: Decimal
  future: Decimal
  hasApi?: boolean
  isMocked?: boolean
}) => {
  const formattedCurrent = formatNumber(current, 'token.amount')
  const formattedFuture = formatNumber(future, 'token.amount')

  getActionValue('borrow-collateral', getTimeoutCategory('evm.simulation', isMocked), 'previous').should(
    'equal',
    formattedCurrent,
  )
  getActionValue('borrow-collateral', getTimeoutCategory('evm.simulation', isMocked)).should('equal', formattedFuture)
  checkEstimatedTxCost({ hasValue: hasApi, category: getTimeoutCategory('evm.simulation', isMocked) })
  cy.get('[data-testid="loan-form-errors"]').should('not.exist')
}

export const checkCurrentCollateral = (expected: Decimal, isMocked = false) => {
  const formatted = formatNumber(expected, 'token.amount')
  getActionValue('borrow-collateral', getTimeoutCategory('evm.simulation', isMocked)).should('equal', formatted)
  getActionValue('borrow-collateral', getTimeoutCategory('evm.simulation', isMocked), 'previous').should(
    'equal',
    formatted,
  )
}
