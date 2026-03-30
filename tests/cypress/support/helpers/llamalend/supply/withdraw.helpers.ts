import { LOAD_TIMEOUT } from '@cy/support/ui'
import type { Decimal } from '@primitives/decimal.utils'
import {
  checkSupplyActionInfoValues,
  checkSupplySubmitButtonText,
  submitSupplyForm,
  touchSupplyInput,
  writeSupplyInput,
} from './supply.helpers'

export const submitWithdrawForm = () => submitSupplyForm('withdraw', 'Withdraw successful!')

/**
 * Fill in the withdraw form with the specified amount.
 */
export function writeWithdrawForm({ amount }: { amount: Decimal }) {
  writeSupplyInput({ type: 'withdraw', amount })
}

/**
 * Check all withdraw detail values are loaded and valid.
 * The action info list is expected to be opened before calling this function.
 */
export function checkWithdrawDetailsLoaded({
  amountSupplied,
  prevAmountSupplied,
  expectedButtonText = 'Withdraw',
  symbol = 'crvUSD',
}: {
  amountSupplied: Decimal
  prevAmountSupplied: Decimal
  expectedButtonText?: string
  symbol?: string
}) {
  checkSupplyActionInfoValues({ amountSupplied, prevAmountSupplied, symbol })
  checkSupplySubmitButtonText('withdraw', expectedButtonText)
}

/**
 * Select max withdraw by clicking the Max chip.
 */
export const selectMaxWithdraw = () => {
  cy.get('[data-testid="input-chip-Max"]', LOAD_TIMEOUT).click({ force: true })
}

/**
 * Touch the withdraw form to refresh state after submission.
 */
export const touchWithdrawForm = () => touchSupplyInput('withdraw')
