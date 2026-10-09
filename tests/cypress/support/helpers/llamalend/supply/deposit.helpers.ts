import { SOLVENCY_THRESHOLDS } from '@/llamalend/markets.constants'
import { TIMEOUTS, getTimeoutCategory } from '@cy/support/timeout-categories'
import type { Decimal } from '@primitives/decimal.utils'
import {
  checkSupplyActionInfoValues,
  checkSupplySubmitButtonText,
  submitSupplyForm,
  touchSupplyInput,
  writeSupplyInput,
} from './supply.helpers'

export const submitDepositForm = ({
  solvencyPercent = 100,
  isMocked = false,
}: {
  solvencyPercent?: number
  isMocked?: boolean
}) => {
  if (solvencyPercent <= SOLVENCY_THRESHOLDS.solvent && solvencyPercent > SOLVENCY_THRESHOLDS.low) {
    return confirmLowSolvencyDepositForm(isMocked)
  }
  return submitSupplyForm('deposit', 'Deposit successful!', isMocked)
}

const confirmLowSolvencyDepositForm = (isMocked = false) => {
  cy.get('[data-testid="supply-deposit-submit-button"]').click(TIMEOUTS['ui.interaction'])
  cy.get('[data-testid="low-solvency-action-checkbox"]').click()
  cy.get('[data-testid="low-solvency-action-submit-button"]').click()
  return cy
    .get('[data-testid="toast-success"]', TIMEOUTS[getTimeoutCategory('evm.confirmation', isMocked)])
    .contains('Deposit successful!', TIMEOUTS[getTimeoutCategory('evm.confirmation', isMocked)])
}

/**
 * Fill in the deposit form with the specified amount.
 */
export const writeDepositForm = ({ amount }: { amount: Decimal }) => writeSupplyInput({ type: 'deposit', amount })

/**
 * Check the deposit submit state for enabled and disabled markets.
 */
export function checkDepositSubmit({
  buttonText,
  withDisabledAlert,
  maxDeposit,
  solvencyPercent,
  isMocked = false,
}: {
  buttonText: string
  withDisabledAlert?: boolean
  maxDeposit?: Decimal
  solvencyPercent: number
  isMocked?: boolean
}) {
  if (withDisabledAlert || solvencyPercent < SOLVENCY_THRESHOLDS.low) {
    cy.get('[data-testid="supply-deposit-submit-button"]').should('not.exist')
    cy.get('[data-testid="alert-disable-form"]').should('exist')
    return
  }
  if (maxDeposit) {
    cy.get('[data-testid="supply-deposit-submit-button"]', TIMEOUTS['ui.render']).should('be.disabled')
    return
  }

  checkSupplySubmitButtonText('deposit', buttonText, isMocked)
}

/**
 * Check all deposit detail values are loaded and valid.
 * The action info list is expected to be opened before calling this function.
 */
export const checkDepositDetailsLoaded = ({
  suppliedAssets,
  prevSuppliedAssets,
  symbol = 'crvUSD',
  hasApi = true,
  isMocked = false,
}: {
  suppliedAssets: Decimal
  prevSuppliedAssets: Decimal
  symbol?: string
  hasApi?: boolean
  isMocked?: boolean
}) => {
  checkSupplyActionInfoValues({ suppliedAssets, prevSuppliedAssets, symbol, hasApi, isMocked })
}

/**
 * Touch the deposit form to refresh state after submission.
 */
export const touchDepositForm = () => touchSupplyInput('deposit')

/**
 * Verifies the deposit max-limit error is shown only when a maxDeposit is set.
 */
export const checkMaxDeposit = (maxDeposit?: Decimal) => {
  cy.contains(`Amount exceeds maximum of${maxDeposit ? ' ' + maxDeposit : ''}`, TIMEOUTS['ui.render']).should(
    maxDeposit ? 'be.visible' : 'not.exist',
  )
}
