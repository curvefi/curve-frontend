import { LOAD_TIMEOUT } from '@cy/support/ui'
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
    .should(value => expect(Number(value)).gt(0))
    .then(value => value as Decimal)

export const selectMaxUnstake = () => {
  // Percentage chips are hidden until hover in desktop layouts.
  cy.get('[data-testid="supply-unstake-input"] [data-testid="input-chip-100%"]', LOAD_TIMEOUT).click({ force: true })
  cy.get('[data-testid="supply-unstake-input"] input[type="text"]', LOAD_TIMEOUT)
    .invoke(LOAD_TIMEOUT, 'attr', 'data-value')
    .should(value => expect(Number(value)).gt(0))
  cy.get('[data-testid="supply-action-info-list"]', LOAD_TIMEOUT).should('be.visible')
}

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
}: {
  vaultShares?: Decimal
  prevVaultShares?: Decimal
  suppliedAssets?: Decimal
  prevSuppliedAssets?: Decimal
  expectedButtonText?: string
  symbol?: string
  hasApi?: boolean
}) {
  checkSupplyActionInfoValues({
    vaultShares,
    prevVaultShares,
    suppliedAssets,
    prevSuppliedAssets,
    symbol,
    hasApi,
  })
  checkSupplySubmitButtonText('unstake', expectedButtonText)
}

/**
 * Touch the unstake form to refresh state after submission.
 */
export const touchUnstakeForm = () => touchSupplyInput('unstake')
