import { TIMEOUTS, getTimeoutCategory } from '@cy/support/timeout-categories'
import type { Decimal } from '@primitives/decimal.utils'
import {
  checkDebt,
  checkEstimatedTxCost,
  type DebtCheck,
  DECIMAL_RANGE_REGEX,
  DECIMAL_REGEX,
  getActionValue,
} from './action-info.helpers'
import { submitLoanForm } from './loan-form.helpers'

const getResetPositionConvertedInput = () =>
  cy.get('[data-testid="reset-position-input-converted-borrowed"] input[type="text"]', TIMEOUTS['ui.render'])

const getResetPositionWalletInput = () =>
  cy.get('[data-testid="reset-position-input-user-borrowed"] input[type="text"]', TIMEOUTS['ui.render'])

export function checkClosePositionDetailsLoaded({ debt, isMocked = false }: { debt: Decimal; isMocked?: boolean }) {
  cy.get('[data-testid="loan-action-settings"] [data-testid="borrow-slippage"]').should('be.visible')
  cy.get('[data-testid="outstanding-debt"]').invoke('text').should('match', DECIMAL_REGEX) // first check the number is displayed before converting to number
  cy.get('[data-testid="outstanding-debt"]')
    .invoke('text')
    .should(val => {
      const actualDebt = Number(/[\d.]+/.exec(val)?.[0]) // parse the first number
      expect(actualDebt).to.be.closeTo(Number(debt), Number(debt) * 0.01)
    })
  cy.get('[data-testid="loan-form-errors"]').should('not.exist')
  cy.get('[data-testid="you-recover"]').invoke('text').should('match', DECIMAL_REGEX)
  checkEstimatedTxCost({ category: getTimeoutCategory('evm.simulation', isMocked) })
  cy.get('[data-testid="loan-form-errors"]').should('not.exist')
}

export const submitClosePositionForm = (isMocked = false) =>
  submitLoanForm({ form: 'close-position', message: 'Position closed successfully!', isMocked })

export function checkResetPositionInputsLoaded({ convertedBorrowed }: { convertedBorrowed: Decimal }) {
  getResetPositionConvertedInput().should('have.value', convertedBorrowed)
  getResetPositionConvertedInput().should('be.disabled')
  getResetPositionWalletInput().should('have.value', '')
}

export const checkResetPositionMinimumWalletMessage = () => {
  cy.get('[data-testid="reset-position-input-user-borrowed"]')
    .should('contain.text', 'Increase amount to push future liquidation threshold lower')
    .and('contain.text', 'Minimum from wallet:')
}

export function checkResetPositionDetailsLoaded({ debt, isMocked = false }: { debt: DebtCheck; isMocked?: boolean }) {
  getActionValue('borrow-price-range', getTimeoutCategory('evm.simulation', isMocked)).should(
    'match',
    DECIMAL_RANGE_REGEX,
  )
  getActionValue('borrow-apr', getTimeoutCategory('evm.simulation', isMocked)).should('include', '%')
  checkEstimatedTxCost({ category: getTimeoutCategory('evm.simulation', isMocked) })
  checkDebt(debt, { isMocked })
  cy.get('[data-testid="loan-form-errors"]').should('not.exist')
}

export function writeResetPositionWalletAmount({ amount }: { amount: Decimal }) {
  getResetPositionWalletInput().clear()
  getResetPositionWalletInput().type(amount)
  getResetPositionWalletInput().blur()
  getResetPositionWalletInput().should('have.value', amount)
}

export const clickResetPositionMinimumWalletAmount = (isMocked = false) => {
  cy.get(
    '[data-testid="reset-position-input-user-borrowed"] [data-testid="helper-message-number-0"]',
    TIMEOUTS[getTimeoutCategory('evm.simulation', isMocked)],
  ).click()
}

export const checkResetPositionWalletAmount = ({ amount }: { amount: Decimal }) =>
  getResetPositionWalletInput().should('have.value', amount)

export const submitResetPositionForm = ({ message, isMocked = false }: { message: string; isMocked?: boolean }) =>
  submitLoanForm({ form: 'reset-position', message, isMocked })
