import type { FormDisabledAlert } from '@/llamalend/llamalend.types'
import { LOAD_TIMEOUT } from '@cy/support/ui'
import type { Decimal } from '@primitives/decimal.utils'
import {
  checkSupplyActionInfoValues,
  checkSupplySubmitButtonText,
  submitSupplyForm,
  touchSupplyInput,
  writeSupplyInput,
} from './supply.helpers'

export const submitDepositForm = () => submitSupplyForm('deposit', 'Deposit successful!')

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
  depositAlert,
  maxDeposit,
}: {
  buttonText: string
  depositAlert?: FormDisabledAlert
  maxDeposit?: Decimal
}) {
  if (depositAlert) {
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
