import { submitLoanForm } from '@cy/support/helpers/llamalend/create-loan.helpers'
import { LOAD_TIMEOUT } from '@cy/support/ui'
import type { Decimal } from '@primitives/decimal.utils'
import { notFalsy } from '@primitives/objects.utils'
import { checkDebt, type DebtCheck, getActionValue, touchInput } from './action-info.helpers'

const getRepayInput = () => cy.get('[data-testid^="repay-input-"] input[type="text"]', LOAD_TIMEOUT).first()

export function selectRepayToken({
  symbol,
  tokenAddress,
  hasLeverageManagement,
}: {
  symbol: string
  tokenAddress: string
  hasLeverageManagement: boolean
}) {
  if (!hasLeverageManagement) {
    return cy.get(`[data-testid="token-icon-${tokenAddress.toLowerCase()}"]`, LOAD_TIMEOUT).should('be.visible')
  }
  cy.get('[data-testid^="repay-input-"] [aria-haspopup="listbox"]', LOAD_TIMEOUT).click()
  cy.get(`[data-testid="token-option-${symbol}"]`, LOAD_TIMEOUT).click()
  cy.get(`[data-testid="token-icon-${tokenAddress.toLowerCase()}"]`, LOAD_TIMEOUT).should('be.visible')
}

export function writeRepayLoanForm({ amount }: { amount: Decimal }) {
  getRepayInput().clear()
  getRepayInput().type(amount)
  getRepayInput().blur() // make sure field is touched to open the action info list
}

export const touchRepayLoanForm = () => touchInput(getRepayInput)

export function checkRepayDetailsLoaded({
  leverageEnabled,
  debt,
  isPriceChanged = true,
}: {
  debt: DebtCheck
  leverageEnabled?: boolean
  isPriceChanged?: boolean
}) {
  cy.get('[data-testid="borrow-leverage-info-list"]', LOAD_TIMEOUT).should(leverageEnabled ? 'be.visible' : 'not.exist')
  getActionValue('borrow-price-range', ...notFalsy(!isPriceChanged && 'previous')).should(
    'match',
    /(\d(\.\d+)?) - (\d(\.\d+)?)/,
  )
  getActionValue('borrow-apr').should('include', '%')
  getActionValue('estimated-tx-cost').should('include', '$')
  checkDebt(debt)
  cy.get('[data-testid="loan-form-errors"]').should('not.exist')
}

export const submitRepayForm = () => submitLoanForm({ form: 'repay', message: 'Loan repaid!' })
