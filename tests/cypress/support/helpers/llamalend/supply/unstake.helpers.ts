import type { Decimal } from '@primitives/decimal.utils'
import {
  getSupplyInputBalanceValueAttr,
  checkSupplyActionInfoValues,
  checkSupplySubmitButtonText,
  submitSupplyForm,
  touchSupplyInput,
  writeSupplyInput,
} from './supply.helpers'

export const submitUnstakeForm = (isMocked = false) => submitSupplyForm('unstake', 'Unstake successful!', isMocked)

export const readUnstakeAvailableAssets = (isMocked = false) =>
  getSupplyInputBalanceValueAttr('unstake', isMocked)
    .should(value => expect(Number(value)).gt(0))
    .then(value => value as Decimal)

/**
 * Fill in the unstake form with the specified underlying asset value.
 */
export const writeUnstakeForm = ({ assets }: { assets: Decimal }) =>
  writeSupplyInput({ type: 'unstake', amount: assets })

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
  hasApi = true,
  isMocked = false,
}: {
  vaultShares?: Decimal
  prevVaultShares?: Decimal
  suppliedAssets?: Decimal
  prevSuppliedAssets?: Decimal
  expectedButtonText?: string
  symbol?: string
  hasApi?: boolean
  isMocked?: boolean
}) {
  checkSupplyActionInfoValues({
    vaultShares,
    prevVaultShares,
    suppliedAssets,
    prevSuppliedAssets,
    symbol,
    hasApi,
    isMocked,
  })
  checkSupplySubmitButtonText('unstake', expectedButtonText, isMocked)
}

/**
 * Touch the unstake form to refresh state after submission.
 */
export const touchUnstakeForm = () => touchSupplyInput('unstake')
