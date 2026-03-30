import type { Decimal } from '@primitives/decimal.utils'
import {
  checkSupplyActionInfoValues,
  checkSupplySubmitButtonText,
  submitSupplyForm,
  touchSupplyInput,
  writeSupplyInput,
} from './supply.helpers'

export const submitStakeForm = () => submitSupplyForm('stake', 'Stake successful!')

/**
 * Fill in the stake form with the specified amount.
 */
export function writeStakeForm({ amount }: { amount: Decimal }) {
  writeSupplyInput({ type: 'stake', amount })
}

/**
 * Check all stake detail values are loaded and valid.
 * The action info list is expected to be opened before calling this function.
 */
export function checkStakeDetailsLoaded({
  vaultShares,
  prevVaultShares,
  amountSupplied,
  prevAmountSupplied,
  expectedButtonText = 'Stake',
  symbol = 'crvUSD',
  checkEstimatedTxCost = true,
}: {
  vaultShares: Decimal
  prevVaultShares: Decimal
  amountSupplied?: Decimal
  prevAmountSupplied?: Decimal
  expectedButtonText?: string
  symbol?: string
  checkEstimatedTxCost?: boolean
}) {
  checkSupplyActionInfoValues({
    vaultShares,
    prevVaultShares,
    amountSupplied,
    prevAmountSupplied,
    symbol,
    checkEstimatedTxCost,
  })
  checkSupplySubmitButtonText('stake', expectedButtonText)
}

/**
 * Touch the stake form to refresh state after submission.
 */
export const touchStakeForm = () => touchSupplyInput('stake')
