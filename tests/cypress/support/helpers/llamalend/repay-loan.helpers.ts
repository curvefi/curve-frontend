import { waitForRoutesLoaded } from '@cy/support/helpers/llamalend/create-loan.helpers'
import { TIMEOUTS, getTimeoutCategory } from '@cy/support/timeout-categories'
import type { Decimal } from '@primitives/decimal.utils'
import { notFalsy } from '@primitives/objects.utils'
import { checkDebt, checkEstimatedTxCost, type DebtCheck, getActionValue, touchInput } from './action-info.helpers'
import { submitLoanForm } from './loan-form.helpers'

const getRepayInput = () => cy.get('[data-testid^="repay-input-"] input[type="text"]', TIMEOUTS['ui.render']).first()

export function selectRepayToken({
  symbol,
  tokenAddress,
  hasLeverageManagement,
  optionIndex = 0,
}: {
  symbol: string
  tokenAddress: string
  hasLeverageManagement: boolean
  optionIndex?: number
}) {
  const tokenIconTestId = `token-icon-${tokenAddress.toLowerCase()}`
  if (!hasLeverageManagement) {
    return cy.get(`[data-testid="${tokenIconTestId}"]`, TIMEOUTS['ui.render']).should('be.visible')
  }
  cy.get('[data-testid^="repay-input-"] [aria-haspopup="listbox"]', TIMEOUTS['ui.interaction']).click()
  cy.get(`[data-testid="token-option-${tokenAddress.toLowerCase()}"]`, TIMEOUTS['ui.render'])
    .filter(`:has([data-testid="${tokenIconTestId}"])`)
    .eq(optionIndex)
    .click()
  cy.get(`[data-testid="${tokenIconTestId}"]`, TIMEOUTS['ui.render']).should('be.visible')
  cy.get('[data-testid^="repay-input-"]', TIMEOUTS['ui.render']).contains(symbol).should('be.visible')
}

export function writeRepayLoanForm({
  amount,
  waitForRoutes,
  isMocked = false,
}: {
  amount: Decimal
  waitForRoutes?: boolean
  isMocked?: boolean
}) {
  getRepayInput().clear()
  getRepayInput().type(amount)
  getRepayInput().blur() // make sure field is touched to open the action info list
  if (waitForRoutes) waitForRoutesLoaded({ submitButtonTestId: 'repay-submit-button', isMocked })
}

export const touchRepayLoanForm = () => touchInput(getRepayInput)

export function checkRepayDetailsLoaded({
  leverageEnabled,
  debt,
  isPriceChanged = true,
  hasApi = true,
  controllerApproved = true,
  isMocked = false,
}: {
  debt: DebtCheck
  leverageEnabled?: boolean
  isPriceChanged?: boolean
  hasApi?: boolean
  controllerApproved?: boolean
  isMocked?: boolean
}) {
  cy.get('[data-testid="borrow-leverage-info-list"]', TIMEOUTS['ui.render']).should(
    leverageEnabled ? 'be.visible' : 'not.exist',
  )
  cy.get('[data-testid="loan-action-settings"]', TIMEOUTS['ui.render']).should(
    leverageEnabled ? 'be.visible' : 'not.be.visible',
  )
  getActionValue(
    'borrow-price-range',
    getTimeoutCategory('evm.simulation', isMocked),
    ...notFalsy(!isPriceChanged && 'previous'),
  ).should('match', /(\d(\.\d+)?) - (\d(\.\d+)?)/)
  getActionValue('borrow-apr', getTimeoutCategory('evm.simulation', isMocked)).should('include', '%')
  checkEstimatedTxCost({
    hasValue: hasApi && controllerApproved,
    category: getTimeoutCategory('evm.simulation', isMocked),
  })
  checkDebt(debt, { checkLoanToValue: hasApi, isMocked })
  cy.get('[data-testid="loan-form-errors"]').should('not.exist')
}

export const submitRepayForm = ({
  controllerApproved = true,
  isMocked = false,
}: { controllerApproved?: boolean; isMocked?: boolean } = {}) =>
  submitLoanForm({ form: 'repay', message: 'Loan repaid!', approveDelegation: !controllerApproved, isMocked })
