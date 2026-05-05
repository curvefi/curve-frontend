import { checkLeverageCheckbox, submitLoanForm } from '@cy/support/helpers/llamalend/create-loan.helpers'
import type { Decimal } from '@primitives/decimal.utils'
import { LOAD_TIMEOUT } from '../../ui'
import { checkDebt, DECIMAL_REGEX, getActionValue, touchInput } from './action-info.helpers'

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
}: {
  debt: Decimal
  userCollateral?: Decimal
  leverageEnabled: boolean
  hasLeverageManagement: boolean
}) {
  if (userCollateral) {
    getCollateralInput().clear()
    getCollateralInput().type(userCollateral)
  }
  getDebtInput().clear()
  getDebtInput().type(debt)
  getDebtInput().blur() // make sure field is touched to open the action info list
  if (leverageEnabled) cy.get('[data-testid="leverage-checkbox"]').click()
  checkLeverageCheckbox({ leverageEnabled, hasLeverage: hasLeverageManagement })
}

export const touchBorrowMoreForm = () => touchInput(getDebtInput)

export function checkBorrowMoreDetailsLoaded({
  leverageEnabled,
  expectedFutureDebt,
  expectedCurrentDebt,
}: {
  expectedFutureDebt: Decimal
  expectedCurrentDebt: Decimal
  leverageEnabled: boolean
}) {
  getActionValue('borrow-apr').should('include', '%')
  getActionValue('borrow-health').should('match', DECIMAL_REGEX)
  getActionValue('borrow-health', 'previous').should('match', DECIMAL_REGEX)
  getActionValue('estimated-tx-cost').should('include', '$')
  checkDebt({ current: expectedCurrentDebt, future: expectedFutureDebt, symbol: 'crvUSD' })
  cy.get('[data-testid="loan-form-errors"]').should('not.exist')
  if (leverageEnabled) {
    getActionValue('borrow-price-impact').should('include', '%')
    getActionValue('borrow-slippage').should('include', '%')
  }
}

export const submitBorrowMoreForm = () => submitLoanForm({ form: 'borrow-more', message: 'Borrowed more!' })
