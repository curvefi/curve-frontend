import { LoanPreset } from '@/llamalend/constants'
import { oneOf, oneValueOf } from '@cy/support/generators'
import { LOAD_TIMEOUT, TRANSACTION_LOAD_TIMEOUT } from '@cy/support/ui'
import { type AlertColor } from '@mui/material/Alert'
import type { Decimal } from '@primitives/decimal.utils'
import { LlamaMarketType } from '@ui-kit/types/market'
import { Chain } from '@ui-kit/utils/network'
import { DECIMAL_RANGE_REGEX, getActionValue } from './action-info.helpers'

const chainId = Chain.Ethereum

export const CREATE_LOAN_FUND_AMOUNT = '0x3635c9adc5dea00000' // 1000 ETH=1e21 wei
const collateralDecimals = 18

export const LOAN_TEST_MARKETS = {
  [LlamaMarketType.Mint]: [
    // todo: fix buggy market that cannot borrow max: { id: 'wsteth', label: 'wstETH-crvUSD Old Mint Market', collateralAddress: '0x7f39C581F595B53c5cb19bD0b3f8dA6c935E2Ca0', collateral: '0.1', borrow: '10', borrowMore: '2', repay: '1', improveHealth: '1', chainId, path: '/crvusd/ethereum/markets/wsteth', hasLeverage: false },
    {
      id: 'sfrxeth2',
      label: '2nd sfrxETH-crvUSD Old Mint Market',
      collateralAddress: '0xac3e018457b222d93114458476f3e3416abbe38f', // sfrxETH
      controllerAddress: '0xec0820efafc41d8943ee8de495fc9ba8495b15cf',
      collateral: '0.1',
      borrow: '10',
      borrowMore: '2',
      repay: '1',
      improveHealth: '1',
      chainId,
      path: '/crvusd/ethereum/markets/sfrxeth2',
      hasLeverage: false,
      collateralDecimals,
    },
    {
      id: 'wbtc',
      label: 'WBTC-crvUSD New Mint Market',
      collateralAddress: '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599', // wbtc
      controllerAddress: '0x4e59541306910ad6dc1dac0ac9dfb29bd9f15c67',
      collateral: '1',
      borrow: '100',
      borrowMore: '10',
      repay: '30',
      improveHealth: '10',
      chainId,
      path: '/crvusd/ethereum/markets/wbtc',
      hasLeverage: true,
      collateralDecimals,
    },
  ],
  [LlamaMarketType.Lend]: [
    {
      id: 'one-way-market-7',
      label: 'sUSDe-crvUSD Old Lend Market',
      collateralAddress: '0x9D39A5DE30e57443BfF2A8307A4256c8797A3497', // sUSDe
      controllerAddress: '0x98Fc283d6636f6DCFf5a817A00Ac69A3ADd96907',
      collateral: '100',
      borrow: '90',
      borrowMore: '5',
      repay: '50',
      improveHealth: '30',
      chainId,
      path: '/lend/ethereum/markets/0x98Fc283d6636f6DCFf5a817A00Ac69A3ADd96907',
      hasLeverage: false,
      collateralDecimals,
    },
    {
      id: 'one-way-market-41',
      label: 'sreUSD-crvUSD New Lend Market',
      collateralAddress: '0x557ab1e003951a73c12d16f0fea8490e39c33c35', // sreUSD
      controllerAddress: '0x4f79fe450a2baf833e8f50340bd230f5a3ecafe9',
      collateral: '1',
      borrow: '0.8',
      borrowMore: '0.02',
      repay: '0.7',
      improveHealth: '0.01',
      chainId,
      path: '/lend/ethereum/markets/0x4F79Fe450a2BAF833E8f50340BD230f5A3eCaFe9',
      hasLeverage: true,
      collateralDecimals,
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
  getActionValue('borrow-price-range').should('match', DECIMAL_RANGE_REGEX)
  getActionValue('borrow-apr').should('include', '%')
  getActionValue('borrow-apr', 'previous').should('include', '%')
  getActionValue('borrow-ltv').should('include', '%')
  getActionValue('estimated-tx-cost').should('include', '$')

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
  cy.get('[data-testid="borrow-debt-input"] [data-testid="balance-value"]', TRANSACTION_LOAD_TIMEOUT).should('exist')
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
export function checkLoanRangeSlider({ leverageEnabled }: { leverageEnabled: boolean }) {
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
