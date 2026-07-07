import { submitLoanForm } from '@cy/support/helpers/llamalend/create-loan.helpers'
import { LOAD_TIMEOUT } from '@cy/support/ui'
import type { Decimal } from '@primitives/decimal.utils'
import { checkDebt, DECIMAL_RANGE_REGEX, DECIMAL_REGEX, getActionValue, type DebtCheck } from './action-info.helpers'

const getResetPositionConvertedInput = () =>
  cy.get('[data-testid="reset-position-input-converted-borrowed"] input[type="text"]', LOAD_TIMEOUT)

const getResetPositionWalletInput = () =>
  cy.get('[data-testid="reset-position-input-user-borrowed"] input[type="text"]', LOAD_TIMEOUT)

export function checkClosePositionDetailsLoaded({ debt }: { debt: Decimal }) {
  cy.get('[data-testid="outstanding-debt"]').invoke('text').should('match', DECIMAL_REGEX) // first check the number is displayed before converting to number
  cy.get('[data-testid="outstanding-debt"]')
    .invoke('text')
    .then(val => Number(/[\d.]+/.exec(val)?.[0])) // parse the first number
    .should('be.closeTo', Number(debt), Number(debt) * 0.01)
  cy.get('[data-testid="loan-form-errors"]').should('not.exist')
  cy.get('[data-testid="you-recover"]').invoke('text').should('match', DECIMAL_REGEX)
  cy.get('[data-testid="loan-form-errors"]').should('not.exist')
}

export const submitClosePositionForm = (expected: 'success' | 'error' = 'success') =>
  submitLoanForm({
    form: 'close-position',
    message: { success: 'Position closed successfully!', error: 'Transaction failed' }[expected],
    expected,
  })

export function checkResetPositionInputsLoaded({ convertedBorrowed }: { convertedBorrowed: Decimal }) {
  getResetPositionConvertedInput().should('have.value', convertedBorrowed)
  getResetPositionConvertedInput().should('be.disabled')
  getResetPositionWalletInput().should('have.value', '')
}

export function checkResetPositionMinimumWalletMessage() {
  cy.get('[data-testid="reset-position-input-user-borrowed"]')
    .should('contain.text', 'Increase amount to push future liquidation threshold lower')
    .and('contain.text', 'Minimum from wallet:')
}

export function checkResetPositionDetailsLoaded({ debt }: { debt: DebtCheck }) {
  getActionValue('borrow-price-range').should('match', DECIMAL_RANGE_REGEX)
  getActionValue('borrow-apr').should('include', '%')
  getActionValue('estimated-tx-cost').should('include', '$')
  checkDebt(debt)
  cy.get('[data-testid="loan-form-errors"]').should('not.exist')
}

export function writeResetPositionWalletAmount({ amount }: { amount: Decimal }) {
  getResetPositionWalletInput().clear()
  getResetPositionWalletInput().type(amount)
  getResetPositionWalletInput().blur()
}

export function clickResetPositionMinimumWalletAmount() {
  cy.get(
    '[data-testid="reset-position-input-user-borrowed"] [data-testid="helper-message-number-0"]',
    LOAD_TIMEOUT,
  ).click()
}

export function checkResetPositionWalletAmount({ amount }: { amount: Decimal }) {
  getResetPositionWalletInput().should('have.value', amount)
}

export const submitResetPositionForm = ({ message }: { message: string }) =>
  submitLoanForm({ form: 'reset-position', message })
