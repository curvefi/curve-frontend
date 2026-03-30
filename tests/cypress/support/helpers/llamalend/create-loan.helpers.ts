import { LoanPreset } from '@/llamalend/constants'
import { oneOf, oneValueOf } from '@cy/support/generators'
import { LOAN_TEST_MARKETS } from '@cy/support/helpers/llamalend/test-markets'
import { API_LOAD_TIMEOUT, LOAD_TIMEOUT, TRANSACTION_LOAD_TIMEOUT } from '@cy/support/ui'
import { type AlertColor } from '@mui/material/Alert'
import type { Decimal } from '@primitives/decimal.utils'
import { LlamaMarketType } from '@ui-kit/types/market'
import { Chain } from '@ui-kit/utils'
import { DECIMAL_RANGE_REGEX, getActionInfoError, getActionValue } from './action-info.helpers'

export const CREATE_LOAN_FUND_AMOUNT = '0x3635c9adc5dea00000' // 1000 ETH=1e21 wei

export const oneLoanTestMarket = (type: LlamaMarketType = oneValueOf(LlamaMarketType), chainId?: Chain) =>
  oneOf(...LOAN_TEST_MARKETS[type].filter((m) => !chainId || m.chainId == chainId))

/**
 * Check all loan detail values are loaded and valid.
 * The action info list is expected to be opened before calling this function.
 */
export function checkLoanDetailsLoaded({
  leverageEnabled,
  expectGasError,
}: {
  leverageEnabled: boolean
  expectGasError?: boolean
}) {
  getActionValue('borrow-price-range').should('match', DECIMAL_RANGE_REGEX)
  getActionValue('borrow-apr').should('include', '%')
  getActionValue('borrow-apr', 'previous').should('include', '%')
  getActionValue('borrow-ltv').should('include', '%')
  if (expectGasError) {
    getActionInfoError('estimated-tx-cost').should('be.visible')
  } else {
    getActionValue('estimated-tx-cost').should('include', '$')
  }

  if (leverageEnabled) {
    getActionValue('borrow-price-impact').should('include', '%')
    getActionValue('borrow-slippage').should('include', '%')
  } else {
    cy.get('[data-testid="borrow-price-impact-value"]', LOAD_TIMEOUT).should('not.exist')
    cy.get('[data-testid="borrow-slippage-value"]', LOAD_TIMEOUT).should('not.exist')
  }

  cy.get('[data-testid="loan-form-errors"]').should('not.exist')
}

const getBorrowInput = () => cy.get('[data-testid="borrow-debt-input"] input[type="text"]')
const getCollateralInput = () => cy.get('[data-testid="borrow-collateral-input"] input[type="text"]')

/**
 * Fill in the create loan form. Assumes the form is already opened.
 */
export function writeCreateLoanForm({
  collateral,
  borrow,
  leverageEnabled,
}: {
  collateral: Decimal
  borrow: Decimal
  leverageEnabled: boolean
}) {
  cy.get('[data-testid="borrow-debt-input"] [data-testid="balance-value"]', API_LOAD_TIMEOUT).should('exist')
  getCollateralInput().type(collateral)
  getCollateralInput().blur()
  cy.get('[data-testid="borrow-debt-input"] [data-testid="balance-value"]').should('not.contain.text', '?')
  getActionValue('borrow-health').should('equal', '∞')
  getBorrowInput().type(borrow)
  getBorrowInput().blur()
  getActionValue('borrow-health').should('not.equal', '∞')
  if (leverageEnabled) cy.get('[data-testid="leverage-checkbox"]').click()
}

/**
 * Test the loan range slider by selecting max ltv and max borrow presets, checking for errors, and clearing them.
 */
export function checkLoanRangeSlider({
  leverageEnabled,
  canBorrowMax,
}: {
  leverageEnabled: boolean
  canBorrowMax: boolean
}) {
  cy.get(`[data-testid="loan-preset-${LoanPreset.MaxLtv}"]`).click()
  cy.get('[data-testid="borrow-set-debt-to-max"]').should('not.exist') // make sure we don't click the previous max
  cy.get('[data-testid="borrow-set-debt-to-max"]', LOAD_TIMEOUT).click()
  cy.get(`[data-testid="loan-preset-${LoanPreset.Safe}"]`).click({ force: true }) // force, tooltip sometimes covers part of it
  cy.get('[data-testid="borrow-set-debt-to-max"]').should('not.exist') // new max is being calculated
  // wait for max borrow to load and verify the input value matches (using data-value for precision)
  cy.get('[data-testid="borrow-set-debt-to-max"] [data-testid="balance-value"]', LOAD_TIMEOUT)
    .invoke(LOAD_TIMEOUT, 'attr', 'data-value')
    .then((maxValue) => getBorrowInput().should('have.value', maxValue))
  cy.get('[data-testid="helper-message-error"]').should('not.exist')
  if (canBorrowMax) {
    // some markets unfortunately are broken due to a llamalend.js bug - the max debt click is not accepted but reverts.
    checkLoanDetailsLoaded({ leverageEnabled })
  }
}

/**
 * Submit the create loan form and wait for the button to be re-enabled.
 */
export function submitCreateLoanForm(expected: AlertColor = 'success', message = 'Loan created') {
  cy.get('[data-testid="create-loan-submit-button"]', LOAD_TIMEOUT).click()
  return cy
    .get(`[data-testid="toast-${expected}"]`, TRANSACTION_LOAD_TIMEOUT)
    .contains(message, TRANSACTION_LOAD_TIMEOUT)
}
