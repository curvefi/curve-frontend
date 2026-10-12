import type { Decimal } from '@primitives/decimal.utils'
import {
  checkSupplyActionInfoValues,
  checkSupplySubmitButtonText,
  submitSupplyForm,
  touchSupplyInput,
  writeSupplyInput,
} from './supply.helpers'

export const submitWithdrawForm = (isMocked = false) => submitSupplyForm('withdraw', 'Withdraw successful!', isMocked)

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
  isMocked = false,
}: {
  suppliedAssets: Decimal
  prevSuppliedAssets: Decimal
  expectedButtonText?: string
  symbol?: string
  hasApi?: boolean
  isMocked?: boolean
}) {
  checkSupplyActionInfoValues({ suppliedAssets, prevSuppliedAssets, symbol, hasApi, isMocked })
  checkSupplySubmitButtonText('withdraw', expectedButtonText, isMocked)
}

/**
 * Touch the withdraw form to refresh state after submission.
 */
export const touchWithdrawForm = () => touchSupplyInput('withdraw')
