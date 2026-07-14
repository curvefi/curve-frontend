import { BigNumber } from 'bignumber.js'
import { LOAD_TIMEOUT } from '@cy/support/ui'
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

export const submitStakeForm = () => submitSupplyForm('stake', 'Stake successful!')

export const readStakeAvailableAssets = () =>
  getSupplyInputBalanceValueAttr('stake')
    .should(balanceValue => expect(new BigNumber(balanceValue || '0').gt(0)).to.equal(true))
    .then(balanceValue => balanceValue as Decimal)

export const selectMaxStake = () => {
  // Percentage chips are hidden until hover in desktop layouts.
  cy.get('[data-testid="supply-stake-input"] [data-testid="input-chip-100%"]', LOAD_TIMEOUT).click({ force: true })
  cy.get('[data-testid="supply-stake-input"] input[type="text"]', LOAD_TIMEOUT)
    .invoke(LOAD_TIMEOUT, 'attr', 'data-value')
    .should(value => expect(Number(value)).gt(0))
  cy.get('[data-testid="supply-action-info-list"]', LOAD_TIMEOUT).should('be.visible')
}

/**
 * Fill in the stake form with the specified underlying asset value.
 */
export const writeStakeForm = ({ assets }: { assets: Decimal }) => writeSupplyInput({ type: 'stake', amount: assets })

/**
 * Check the stake submit state for enabled and disabled markets.
 */
export function checkStakeSubmit({ buttonText, hasGauge = true }: { buttonText: string; hasGauge?: boolean }) {
  if (!hasGauge) {
    cy.get('[data-testid="supply-stake-submit-button"]').should('not.exist')

    checkSupplyAlert('alert-no-gauge')

    return
  }

  checkSupplySubmitButtonText('stake', buttonText)
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
  checkSupplySubmitButtonText('stake', expectedButtonText)
}

/**
 * Touch the stake form to refresh state after submission.
 */
export const touchStakeForm = () => touchSupplyInput('stake')
