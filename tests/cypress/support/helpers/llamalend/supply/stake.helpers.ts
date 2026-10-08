import { BigNumber } from 'bignumber.js'
import type { Decimal } from '@primitives/decimal.utils'
import {
  getSupplyInputBalanceValueAttr,
  checkSupplyActionInfoValues,
  checkSupplySubmitButtonText,
  submitSupplyForm,
  touchSupplyInput,
  writeSupplyInput,
  checkSupplyAlert,
} from './supply.helpers'

export const submitStakeForm = (isMocked = false) => submitSupplyForm('stake', 'Stake successful!', isMocked)

export const readStakeAvailableAssets = (isMocked = false) =>
  getSupplyInputBalanceValueAttr('stake', isMocked)
    .should(balanceValue => expect(new BigNumber(balanceValue || '0').gt(0)).to.equal(true))
    .then(balanceValue => balanceValue as Decimal)

/**
 * Fill in the stake form with the specified underlying asset value.
 */
export const writeStakeForm = ({ assets }: { assets: Decimal }) => writeSupplyInput({ type: 'stake', amount: assets })

/**
 * Check the stake submit state for enabled and disabled markets.
 */
export function checkStakeSubmit({
  buttonText,
  hasGauge = true,
  isMocked = false,
}: {
  buttonText: string
  hasGauge?: boolean
  isMocked?: boolean
}) {
  if (!hasGauge) {
    cy.get('[data-testid="supply-stake-submit-button"]').should('not.exist')

    checkSupplyAlert('alert-no-gauge')

    return
  }

  checkSupplySubmitButtonText('stake', buttonText, isMocked)
}

/**
 * Check all stake detail values are loaded and valid.
 * The action info list is expected to be opened before calling this function.
 */
export function checkStakeDetailsLoaded({
  vaultShares,
  prevVaultShares,
  suppliedAssets,
  prevSuppliedAssets,
  expectedButtonText = 'Stake',
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
  checkSupplySubmitButtonText('stake', expectedButtonText, isMocked)
}

/**
 * Touch the stake form to refresh state after submission.
 */
export const touchStakeForm = () => touchSupplyInput('stake')
