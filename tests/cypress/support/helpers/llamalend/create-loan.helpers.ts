import { LoanPreset } from '@/llamalend/constants'
import { oneOf, oneValueOf } from '@cy/support/generators'
import { LOAD_TIMEOUT, TRANSACTION_LOAD_TIMEOUT } from '@cy/support/ui'
import { type AlertColor } from '@mui/material/Alert'
import { LlamaMarketType } from '@ui-kit/types/market'
import type { Decimal } from '@ui-kit/utils/decimal'
import { Chain } from '@ui-kit/utils/network'
import { getActionValue } from './action-info.helpers'

const chainId = Chain.Ethereum

export const CREATE_LOAN_FUND_AMOUNT = '0x3635c9adc5dea00000' // 1000 ETH=1e21 wei

export const LOAN_TEST_MARKETS = {
  [LlamaMarketType.Mint]: [
    {
      id: 'wsteth',
      label: 'wstETH-crvUSD Old Mint Market',
      collateralAddress: '0x7f39C581F595B53c5cb19bD0b3f8dA6c935E2Ca0', // wstETH
      collateral: '0.1',
      borrow: '10',
      borrowMore: '2',
      repay: '5',
      chainId,
      path: '/crvusd/ethereum/markets/wsteth',
      hasLeverage: false,
    },
    {
      id: 'wbtc',
      label: 'WBTC-crvUSD New Mint Market',
      collateralAddress: '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599', // wbtc
      collateral: '1',
      borrow: '100',
      borrowMore: '10',
      repay: '50',
      chainId,
      path: '/crvusd/ethereum/markets/wbtc',
      hasLeverage: true,
    },
  ],
  [LlamaMarketType.Lend]: [
    {
      id: 'one-way-market-7',
      label: 'sUSDe-crvUSD Old Lend Market',
      collateralAddress: '0x9D39A5DE30e57443BfF2A8307A4256c8797A3497', // sUSDe
      collateral: '100',
      borrow: '90',
      borrowMore: '5',
      repay: '50',
      chainId,
      path: '/lend/ethereum/markets/0x98Fc283d6636f6DCFf5a817A00Ac69A3ADd96907',
      hasLeverage: false,
    },
    {
      id: 'one-way-market-14',
      label: 'USDe-crvUSD New Lend Market',
      collateralAddress: '0x4c9EDD5852cd905f086C759E8383e09bff1E68B3', // USDe
      collateral: '1',
      borrow: '0.9',
      borrowMore: '0.02',
      repay: '0.8',
      chainId,
      path: '/lend/ethereum/markets/0x74f88Baa966407b50c10B393bBD789639EFfE78B',
      hasLeverage: true,
    },
  ],
} as const

export const oneLoanTestMarket = (type: LlamaMarketType = oneValueOf(LlamaMarketType)) =>
  oneOf(...LOAN_TEST_MARKETS[type])

/**
 * Check all loan detail values are loaded and valid.
 * The action info list is expected to be opened before calling this function.
 */
export function checkLoanDetailsLoaded({ leverageEnabled }: { leverageEnabled: boolean }) {
  getActionValue('borrow-band-range').should('match', /(\d(\.\d+)?) to (-?\d(\.\d+)?)/)
  getActionValue('borrow-price-range').should('match', /(\d(\.\d+)?) - (\d(\.\d+)?)/)
  getActionValue('borrow-apr').should('include', '%')
  getActionValue('borrow-apr', 'previous').should('include', '%')
  getActionValue('borrow-ltv').should('include', '%')
  getActionValue('borrow-n').should('eq', '50')

  if (leverageEnabled) {
    getActionValue('borrow-price-impact').should('include', '%')
    getActionValue('borrow-slippage').should('include', '%')
  } else {
    cy.get('[data-testid="borrow-price-impact-value"]', LOAD_TIMEOUT).should('not.exist')
    cy.get('[data-testid="borrow-slippage-value"]', LOAD_TIMEOUT).should('not.exist')
  }

  cy.get('[data-testid="loan-form-errors"]').should('not.exist')
}

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
  cy.get('[data-testid="borrow-debt-input"] [data-testid="balance-value"]', LOAD_TIMEOUT).should('exist')
  cy.get('[data-testid="borrow-collateral-input"] input[type="text"]').first().type(collateral)
  cy.get('[data-testid="borrow-debt-input"] [data-testid="balance-value"]').should('not.contain.text', '?')
  getActionValue('borrow-health').should('equal', '∞')
  cy.get('[data-testid="borrow-debt-input"] input[type="text"]').first().type(borrow)
  getActionValue('borrow-health').should('not.equal', '∞')
  if (leverageEnabled) cy.get('[data-testid="leverage-checkbox"]').click()
}

/**
 * Test the loan range slider by selecting max ltv and max borrow presets, checking for errors, and clearing them.
 */
export function checkLoanRangeSlider({ leverageEnabled }: { leverageEnabled: boolean }) {
  cy.get(`[data-testid="loan-preset-${LoanPreset.MaxLtv}"]`).click()
  cy.get('[data-testid="borrow-set-debt-to-max"]').should('not.exist') // make sure we don't click the previous max
  cy.get('[data-testid="borrow-set-debt-to-max"]', LOAD_TIMEOUT).click()
  cy.get(`[data-testid="loan-preset-${LoanPreset.Safe}"]`).click({ force: true }) // force, tooltip sometimes covers part of it
  cy.get('[data-testid="borrow-set-debt-to-max"]').should('not.exist') // new max is being calculated
  // wait for max borrow to load and verify the input value matches (using data-value for precision)
  cy.get('[data-testid="borrow-set-debt-to-max"] [data-testid="balance-value"]', LOAD_TIMEOUT)
    .invoke(LOAD_TIMEOUT, 'attr', 'data-value')
    .then((maxValue) =>
      cy.get('[data-testid="borrow-debt-input"] input[type="text"]').first().should('have.value', maxValue),
    )
  cy.get('[data-testid="helper-message-error"]').should('not.exist')
  checkLoanDetailsLoaded({ leverageEnabled })
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
