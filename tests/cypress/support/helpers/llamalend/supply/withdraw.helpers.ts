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
export const writeWithdrawForm = ({ amount }: { amount: Decimal }) => writeSupplyInput({ type: 'withdraw', amount })

/**
 * Check all withdraw detail values are loaded and valid.
 * The action info list is expected to be opened before calling this function.
 */
export function checkWithdrawDetailsLoaded({
  suppliedAssets,
  prevSuppliedAssets,
  expectedButtonText = 'Withdraw',
  symbol = 'crvUSD',
  hasApi = true,
}: {
  suppliedAssets: Decimal
  prevSuppliedAssets: Decimal
  expectedButtonText?: string
  symbol?: string
  hasApi?: boolean
}) {
  checkSupplyActionInfoValues({ suppliedAssets, prevSuppliedAssets, symbol, hasApi })
  checkSupplySubmitButtonText('withdraw', expectedButtonText)
}

/**
 * Touch the withdraw form to refresh state after submission.
 */
export const touchWithdrawForm = () => touchSupplyInput('withdraw')
