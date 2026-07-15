import {
  checkLeverageCheckbox,
  submitLoanForm,
  toggleLeverage,
  waitForRoutesLoaded,
} from '@cy/support/helpers/llamalend/create-loan.helpers'
import type { Decimal } from '@primitives/decimal.utils'
import { LOAD_TIMEOUT } from '../../ui'
import { checkDebt, checkEstimatedTxCost, DECIMAL_REGEX, getActionValue, touchInput } from './action-info.helpers'

type BorrowMoreField = 'collateral' | 'user-borrowed' | 'debt'

const getBorrowMoreInput = (field: BorrowMoreField) =>
  cy.get(`[data-testid="borrow-more-input-${field}"] input[type="text"]`, LOAD_TIMEOUT).first()

const getDebtInput = () => getBorrowMoreInput('debt')
const getCollateralInput = () => getBorrowMoreInput('collateral')

export function writeBorrowMoreForm({
  debt,
  userCollateral,
  leverageEnabled,
  hasLeverageManagement,
  waitForRoutes,
}: {
  debt: Decimal
  userCollateral?: Decimal
  leverageEnabled: boolean
  hasLeverageManagement: boolean
  waitForRoutes?: boolean
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
  if (waitForRoutes) waitForRoutesLoaded({ submitButtonTestId: 'borrow-more-submit-button' })
}

export const touchBorrowMoreForm = () => touchInput(getDebtInput)

export function checkBorrowMoreDetailsLoaded({
  leverageEnabled,
  expectedFutureDebt,
  expectedCurrentDebt,
  borrowedSymbol,
  hasApi = true,
}: {
  expectedFutureDebt: Decimal
  expectedCurrentDebt: Decimal
  leverageEnabled: boolean
  borrowedSymbol: string
  hasApi?: boolean
}) {
  getActionValue('borrow-apr').should('include', '%')
  getActionValue('borrow-health').should('match', DECIMAL_REGEX)
  getActionValue('borrow-health', 'previous').should('match', DECIMAL_REGEX)
  checkEstimatedTxCost({ hasValue: hasApi })
  checkDebt(
    { current: expectedCurrentDebt, future: expectedFutureDebt, symbol: borrowedSymbol },
    { checkLoanToValue: hasApi },
  )
  cy.get('[data-testid="loan-form-errors"]').should('not.exist')
  if (leverageEnabled) {
    getActionValue('borrow-price-impact').should('include', '%')
    getActionValue('borrow-slippage').should('include', '%')
  }
}

export const submitBorrowMoreForm = () => submitLoanForm({ form: 'borrow-more', message: 'Borrowed more!' })
