import BigNumber from 'bignumber.js'
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

export const readStakeAvailableAmount = () =>
  getSupplyInputBalanceValueAttr('stake')
    .should((balanceValue) => {
      expect(new BigNumber(balanceValue || '0').gt(0)).to.equal(true)
    })
    .then((balanceValue) => (balanceValue || '0') as Decimal)

/**
 * Fill in the stake form with the specified amount.
 */
export function writeStakeForm({ amount }: { amount: Decimal }) {
  writeSupplyInput({ type: 'stake', amount })
}

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
