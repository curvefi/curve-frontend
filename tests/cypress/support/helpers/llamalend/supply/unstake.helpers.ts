import { BigNumber } from 'bignumber.js'
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

export const readUnstakeAvailableAssets = () =>
  getSupplyInputBalanceValueAttr('unstake')
    .should(balanceValue => {
      expect(new BigNumber(balanceValue || '0').gt(0)).to.equal(true)
    })
    .then(balanceValue => (balanceValue || '0') as Decimal)

/**
 * Fill in the unstake form with the specified underlying asset value.
 */
export function writeUnstakeForm({ assets }: { assets: Decimal }) {
  writeSupplyInput({ type: 'unstake', amount: assets })
}

/**
 * Check all unstake detail values are loaded and valid.
 * The action info list is expected to be opened before calling this function.
 */
export function checkUnstakeDetailsLoaded({
  vaultShares,
  prevVaultShares,
  suppliedAssets,
  prevSuppliedAssets,
  expectedButtonText = 'Unstake',
  symbol = 'crvUSD',
  checkEstimatedTxCost = true,
}: {
  vaultShares?: Decimal
  prevVaultShares?: Decimal
  suppliedAssets?: Decimal
  prevSuppliedAssets?: Decimal
  expectedButtonText?: string
  symbol?: string
  checkEstimatedTxCost?: boolean
}) {
  checkSupplyActionInfoValues({
    vaultShares,
    prevVaultShares,
    suppliedAssets,
    prevSuppliedAssets,
    symbol,
    checkEstimatedTxCost,
  })
  checkSupplySubmitButtonText('unstake', expectedButtonText)
}

/**
 * Touch the unstake form to refresh state after submission.
 */
export const touchUnstakeForm = () => touchSupplyInput('unstake')
