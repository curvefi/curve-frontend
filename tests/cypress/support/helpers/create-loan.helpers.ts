import { LoanPreset } from '@/llamalend/constants'
import { oneOf, oneValueOf } from '@cy/support/generators'
import { type AlertColor } from '@mui/material/Alert'
import { LlamaMarketType } from '@ui-kit/types/market'
import type { Decimal } from '@ui-kit/utils/decimal'
import { Chain } from '@ui-kit/utils/network'
import { LOAD_TIMEOUT, TRANSACTION_LOAD_TIMEOUT } from '../ui'

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
      borrowMore: '0.1',
      repay: '0.8',
      chainId,
      path: '/lend/ethereum/markets/0x74f88Baa966407b50c10B393bBD789639EFfE78B',
      hasLeverage: true,
    },
  ],
} as const

export const oneLoanTestMarket = (type: LlamaMarketType = oneValueOf(LlamaMarketType)) =>
  oneOf(...LOAN_TEST_MARKETS[type])

const getActionValue = (name: string) => cy.get(`[data-testid="${name}-value"]`, LOAD_TIMEOUT)

/**
 * Check all loan detail values are loaded and valid.
 * The accordion is expected to be opened before calling this function.
 */
export function checkLoanDetailsLoaded({ leverageEnabled }: { leverageEnabled: boolean }) {
  getActionValue('borrow-band-range')
    .invoke(LOAD_TIMEOUT, 'text')
    .should('match', /(\d(\.\d+)?) to (-?\d(\.\d+)?)/)
  getActionValue('borrow-price-range')
    .invoke(LOAD_TIMEOUT, 'text')
    .should('match', /(\d(\.\d+)?) - (\d(\.\d+)?)/)
  getActionValue('borrow-apr').contains('%')
  getActionValue('borrow-apr-previous').contains('%')
  getActionValue('borrow-ltv').contains('%')
  getActionValue('borrow-n').contains('50')

  if (leverageEnabled) {
    getActionValue('borrow-price-impact').contains('%')
    getActionValue('borrow-slippage').contains('%')
  } else {
    getActionValue('borrow-price-impact').should('not.exist')
    getActionValue('borrow-slippage').should('not.exist')
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
  openAccordion = true,
}: {
  collateral: Decimal
  borrow: Decimal
  leverageEnabled: boolean
  openAccordion?: boolean
}) {
  cy.get('[data-testid="borrow-debt-input"] [data-testid="balance-value"]', LOAD_TIMEOUT).should('exist')
  cy.get('[data-testid="borrow-collateral-input"] input[type="text"]').first().type(collateral)
  cy.get('[data-testid="borrow-debt-input"] [data-testid="balance-value"]').should('not.contain.text', '?')
  getActionValue('borrow-health').should('have.text', '∞')
  cy.get('[data-testid="borrow-debt-input"] input[type="text"]').first().type(borrow)
  getActionValue('borrow-health').should('not.contain.text', '∞')
  if (openAccordion) cy.get('[data-testid="loan-info-accordion"] button', LOAD_TIMEOUT).click() // open the accordion
  if (leverageEnabled) cy.get('[data-testid="leverage-checkbox"]').click()
}

/**
 * Test the loan range slider by selecting max ltv and max borrow presets, checking for errors, and clearing them.
 */
export function checkLoanRangeSlider({ leverageEnabled }: { leverageEnabled: boolean }) {
  cy.get(`[data-testid="loan-preset-${LoanPreset.MaxLtv}"]`).click()
  cy.get('[data-testid="borrow-set-debt-to-max"]').should('not.exist') // make sure we don't click the previous max
  cy.get('[data-testid="borrow-set-debt-to-max"]', LOAD_TIMEOUT).click()
  cy.get(`[data-testid="loan-preset-${LoanPreset.Safe}"]`).click({ force: true }) // force because sometimes a tooltip covers it
  cy.get('[data-testid="helper-message-error"]', LOAD_TIMEOUT).should('contain.text', 'debt exceeds the maximum')
  cy.get('[data-testid="helper-message-number-0"]').click() // set max again to fix the error
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
