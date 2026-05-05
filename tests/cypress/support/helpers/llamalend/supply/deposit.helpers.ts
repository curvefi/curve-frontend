import { SOLVENCY_THRESHOLDS } from '@/llamalend/llama-markets.constants'
import { LOAD_TIMEOUT, TRANSACTION_LOAD_TIMEOUT } from '@cy/support/ui'
import type { Decimal } from '@primitives/decimal.utils'
import {
  checkSupplyActionInfoValues,
  checkSupplySubmitButtonText,
  submitSupplyForm,
  touchSupplyInput,
  writeSupplyInput,
} from './supply.helpers'

export const submitDepositForm = ({ solvencyPercent = 100 }: { solvencyPercent?: number }) => {
  if (solvencyPercent <= SOLVENCY_THRESHOLDS.solvent && solvencyPercent > SOLVENCY_THRESHOLDS.low) {
    return confirmLowSolvencyDepositForm()
  }
  return submitSupplyForm('deposit', 'Deposit successful!')
}

export const confirmLowSolvencyDepositForm = () => {
  cy.get('[data-testid="supply-deposit-submit-button"]', LOAD_TIMEOUT).should('not.be.disabled').click()
  cy.get('[data-testid="low-solvency-action-checkbox"]').click()
  cy.get('[data-testid="low-solvency-action-submit-button"]').click()
  return cy
    .get('[data-testid="toast-success"]', TRANSACTION_LOAD_TIMEOUT)
    .contains('Deposit successful!', TRANSACTION_LOAD_TIMEOUT)
}

/**
 * Fill in the deposit form with the specified amount.
 */
export function writeDepositForm({ amount }: { amount: Decimal }) {
  writeSupplyInput({ type: 'deposit', amount })
}

/**
 * Check the deposit submit state for enabled and disabled markets.
 */
export function checkDepositSubmit({
  buttonText,
  withDisabledAlert,
  maxDeposit,
  solvencyPercent,
}: {
  buttonText: string
  withDisabledAlert?: boolean
  maxDeposit?: Decimal
  solvencyPercent: number
}) {
  if (withDisabledAlert || solvencyPercent < SOLVENCY_THRESHOLDS.low) {
    cy.get('[data-testid="supply-deposit-submit-button"]').should('not.exist')
    cy.get('[data-testid="alert-disable-form"]').should('exist')
    return
  }
  if (maxDeposit) {
    cy.get('[data-testid="supply-deposit-submit-button"]', LOAD_TIMEOUT).should('be.disabled')
    return
  }

  checkSupplySubmitButtonText('deposit', buttonText)
}

/**
 * Check all deposit detail values are loaded and valid.
 * The action info list is expected to be opened before calling this function.
 */
export function checkDepositDetailsLoaded({
  amountSupplied,
  prevAmountSupplied,
  symbol = 'crvUSD',
}: {
  amountSupplied: Decimal
  prevAmountSupplied: Decimal
  symbol?: string
}) {
  checkSupplyActionInfoValues({ amountSupplied, prevAmountSupplied, symbol })
}

/**
 * Touch the deposit form to refresh state after submission.
 */
export const touchDepositForm = () => touchSupplyInput('deposit')

/**
 * Verifies the deposit max-limit error is shown only when a maxDeposit is set.
 */
export const checkMaxDeposit = (maxDeposit?: Decimal) => {
  cy.contains(`Amount exceeds maximum of${maxDeposit ? ' ' + maxDeposit : ''}`, LOAD_TIMEOUT).should(
    maxDeposit ? 'be.visible' : 'not.exist',
  )
}
