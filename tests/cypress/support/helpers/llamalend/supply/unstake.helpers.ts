import BigNumber from 'bignumber.js'
import type { Decimal } from '@primitives/decimal.utils'
import {
  getSupplyInputBalanceValueAttr,
  checkSupplyActionInfoValues,
  checkSupplySubmitButtonText,
  submitSupplyForm,
  touchSupplyInput,
  writeSupplyInput,
} from './supply.helpers'

export const submitUnstakeForm = () => submitSupplyForm('unstake', 'Unstake successful!')

export const readUnstakeAvailableAmount = () =>
  getSupplyInputBalanceValueAttr('unstake')
    .should(balanceValue => {
      expect(new BigNumber(balanceValue || '0').gt(0)).to.equal(true)
    })
    .then(balanceValue => (balanceValue || '0') as Decimal)

/**
 * Fill in the unstake form with the specified amount.
 */
export function writeUnstakeForm({ amount }: { amount: Decimal }) {
  writeSupplyInput({ type: 'unstake', amount })
}

/**
 * Check all unstake detail values are loaded and valid.
 * The action info list is expected to be opened before calling this function.
 */
export function checkUnstakeDetailsLoaded({
  vaultShares,
  prevVaultShares,
  amountSupplied,
  prevAmountSupplied,
  expectedButtonText = 'Unstake',
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
  checkSupplySubmitButtonText('unstake', expectedButtonText)
}

/**
 * Touch the unstake form to refresh state after submission.
 */
export const touchUnstakeForm = () => touchSupplyInput('unstake')
