import {
  checkLeverageCheckbox,
  toggleLeverage,
  waitForRoutesLoaded,
} from '@cy/support/helpers/llamalend/create-loan.helpers'
import { TIMEOUTS, getTimeoutCategory } from '@cy/support/timeout-categories'
import type { Decimal } from '@primitives/decimal.utils'
import { checkDebt, checkEstimatedTxCost, DECIMAL_REGEX, getActionValue, touchInput } from './action-info.helpers'
import { submitLoanForm } from './loan-form.helpers'

type BorrowMoreField = 'collateral' | 'user-borrowed' | 'debt'

const getBorrowMoreInput = (field: BorrowMoreField) =>
  cy.get(`[data-testid="borrow-more-input-${field}"] input[type="text"]`, TIMEOUTS['ui.render']).first()

const getDebtInput = () => getBorrowMoreInput('debt')
const getCollateralInput = () => getBorrowMoreInput('collateral')

export function writeBorrowMoreForm({
  debt,
  userCollateral,
  leverageEnabled,
  hasLeverageManagement,
  waitForRoutes,
  isMocked = false,
}: {
  debt: Decimal
  userCollateral?: Decimal
  leverageEnabled: boolean
  hasLeverageManagement: boolean
  waitForRoutes?: boolean
  isMocked?: boolean
}) {
  if (userCollateral) {
    getCollateralInput().clear()
    getCollateralInput().type(userCollateral)
  }
  getDebtInput().clear()
  getDebtInput().type(debt)
  getDebtInput().blur() // make sure field is touched to open the action info list
  if (leverageEnabled) toggleLeverage()
  checkLeverageCheckbox({ leverageEnabled, hasLeverage: hasLeverageManagement })
  if (waitForRoutes) waitForRoutesLoaded({ submitButtonTestId: 'borrow-more-submit-button', isMocked })
}

export const touchBorrowMoreForm = () => touchInput(getDebtInput)

export function checkBorrowMoreDetailsLoaded({
  leverageEnabled,
  expectedFutureDebt,
  expectedCurrentDebt,
  borrowedSymbol,
  hasApi = true,
  controllerApproved = true,
  isMocked = false,
}: {
  expectedFutureDebt: Decimal
  expectedCurrentDebt: Decimal
  leverageEnabled: boolean
  borrowedSymbol: string
  hasApi?: boolean
  controllerApproved?: boolean
  isMocked?: boolean
}) {
  getActionValue('borrow-apr', getTimeoutCategory('evm.simulation', isMocked)).should('include', '%')
  getActionValue('borrow-health', getTimeoutCategory('evm.simulation', isMocked)).should('match', DECIMAL_REGEX)
  getActionValue('borrow-health', getTimeoutCategory('evm.simulation', isMocked), 'previous').should(
    'match',
    DECIMAL_REGEX,
  )
  checkEstimatedTxCost({
    hasValue: hasApi && controllerApproved,
    category: getTimeoutCategory('evm.simulation', isMocked),
  })
  checkDebt(
    { current: expectedCurrentDebt, future: expectedFutureDebt, symbol: borrowedSymbol },
    { checkLoanToValue: hasApi, isMocked },
  )
  cy.get('[data-testid="loan-form-errors"]').should('not.exist')
  if (leverageEnabled) {
    cy.get('[data-testid="loan-action-settings"]').within(() => {
      getActionValue('borrow-price-impact', getTimeoutCategory('evm.simulation', isMocked)).should('include', '%')
      cy.get('[data-testid="borrow-slippage"]').should('be.visible')
      getActionValue('borrow-slippage', 'ui.render').should('include', '%')
    })
  }
}

export const submitBorrowMoreForm = ({
  controllerApproved = true,
  isMocked = false,
}: { controllerApproved?: boolean; isMocked?: boolean } = {}) =>
  submitLoanForm({ form: 'borrow-more', message: 'Borrowed more!', approveDelegation: !controllerApproved, isMocked })
