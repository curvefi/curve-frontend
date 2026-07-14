import { LoanPreset } from '@/llamalend/constants'
import { oneOf, oneValueOf } from '@cy/support/generators'
import { LOAD_TIMEOUT, TRANSACTION_LOAD_TIMEOUT } from '@cy/support/ui'
import { type AlertColor } from '@mui/material/Alert'
import type { Decimal } from '@primitives/decimal.utils'
import { LlamaMarketType } from '@ui-kit/types/market'
import { CRVUSD_ADDRESS } from '@ui-kit/utils'
import { Chain } from '@ui-kit/utils/network'
import { DEFAULT_DECIMALS } from '@ui-kit/utils/units'
import { checkEstimatedTxCost, DECIMAL_RANGE_REGEX, getActionValue } from './action-info.helpers'

const chainId = Chain.Ethereum

export const CREATE_LOAN_FUND_AMOUNT = '0x3635c9adc5dea00000' // 1000 ETH=1e21 wei
const BORROWED_SYMBOL = 'crvUSD'
const BORROWED_DECIMALS = DEFAULT_DECIMALS
const COLLATERAL_DECIMALS = DEFAULT_DECIMALS

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
      hasLeverage: true,
      hasLeverageManagement: false,
      collateralDecimals: COLLATERAL_DECIMALS,
      borrowedAddress: CRVUSD_ADDRESS,
      borrowedDecimals: BORROWED_DECIMALS,
      borrowedSymbol: BORROWED_SYMBOL,
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
      hasLeverageManagement: false,
      collateralDecimals: 8,
      borrowedAddress: CRVUSD_ADDRESS,
      borrowedDecimals: BORROWED_DECIMALS,
      borrowedSymbol: BORROWED_SYMBOL,
    },
  ],
  [LlamaMarketType.Lend]: [
    {
      id: 'one-way-market-41',
      label: 'sreUSD-crvUSD v1 Lend Market',
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
      hasLeverageManagement: true,
      collateralDecimals: COLLATERAL_DECIMALS,
      borrowedAddress: CRVUSD_ADDRESS,
      borrowedDecimals: BORROWED_DECIMALS,
      borrowedSymbol: BORROWED_SYMBOL,
    },
    {
      id: 'one-way-market-v2-0',
      label: 'wstETH-WETH LLv2 Lend Market',
      collateralAddress: '0x1f32b1c2345538c0c6f582fcb022739c4a194ebb', // wstETH
      controllerAddress: '0x745422BF49f3F6e4A8E12E4abD19339E7910F8C9',
      collateral: '1',
      borrow: '0.05',
      borrowMore: '0.01',
      repay: '0.02',
      improveHealth: '0.01',
      chainId: Chain.Optimism,
      path: '/lend/optimism/markets/0x745422BF49f3F6e4A8E12E4abD19339E7910F8C9',
      hasLeverage: true,
      hasLeverageManagement: true,
      collateralDecimals: COLLATERAL_DECIMALS,
      borrowedAddress: '0x4200000000000000000000000000000000000006', // WETH
      borrowedDecimals: BORROWED_DECIMALS,
      borrowedSymbol: 'WETH',
    },
  ],
} as const

type TestLlamaMarket = (typeof LOAN_TEST_MARKETS)[LlamaMarketType][number]

export const oneLoanTestMarket = (
  marketType: LlamaMarketType = oneValueOf(LlamaMarketType),
  filter?: (market: TestLlamaMarket) => boolean,
) => ({
  marketType,
  ...oneOf(...(filter ? LOAN_TEST_MARKETS[marketType].filter(filter) : LOAN_TEST_MARKETS[marketType])),
})

/**
 * Check all loan detail values are loaded and valid.
 * The action info list is expected to be opened before calling this function.
 */
export function checkLoanDetailsLoaded({
  leverageEnabled,
  expectError,
  hasApi = true,
}: {
  leverageEnabled: boolean
  expectError?: string
  hasApi?: boolean
}) {
  getActionValue('borrow-price-range').should('match', DECIMAL_RANGE_REGEX)
  getActionValue('borrow-apr').should('include', '%')
  getActionValue('borrow-apr', 'previous').should('include', '%')
  getActionValue('borrow-ltv').should('include', '%')
  getActionValue('borrow-ltv', 'previous').should('include', '%')
  checkEstimatedTxCost({ hasValue: hasApi && !expectError })

  if (leverageEnabled) {
    getActionValue('borrow-price-impact').should('include', '%')
    getActionValue('borrow-slippage').should('include', '%')
  } else {
    cy.get('[data-testid="borrow-price-impact-value"]', LOAD_TIMEOUT).should('not.exist')
    cy.get('[data-testid="borrow-slippage-value"]', LOAD_TIMEOUT).should('not.exist')
  }

  if (expectError) {
    cy.get('[data-testid="helper-message-error"]').contains(expectError)
  } else {
    cy.get('[data-testid="loan-form-errors"]').should('not.exist')
  }
}

const getBorrowInput = () => cy.get('[data-testid="borrow-debt-input"] input[type="text"]')
const getCollateralInput = () => cy.get('[data-testid="borrow-collateral-input"] input[type="text"]')
const getMaxBorrowBalance = (options?: { timeout?: number }) =>
  cy.get('[data-testid="borrow-set-debt-to-max"] [data-testid="balance-value"]', options)

export const checkLeverageCheckbox = ({
  leverageEnabled,
  hasLeverage,
}: {
  leverageEnabled: boolean
  hasLeverage: boolean
}) => {
  if (hasLeverage) {
    cy.get('[data-testid="leverage-checkbox"]').should('be.visible')
    cy.get('[data-testid="leverage-checkbox"] input').should(leverageEnabled ? 'be.checked' : 'not.be.checked')
  } else {
    cy.get('[data-testid="leverage-checkbox"]').should('not.exist')
  }
}

export const waitForRoutesLoaded = ({ submitButtonTestId }: { submitButtonTestId: string }) => {
  cy.get('[data-testid="route-provider-accordion"]').click()
  cy.wait('@routerRoutes', LOAD_TIMEOUT)
  cy.get('[data-testid="refresh-button"]').should('be.enabled')
  cy.get(`[data-testid="${submitButtonTestId}"]`, LOAD_TIMEOUT).should('be.enabled')
}

export const toggleLeverage = () => cy.get('[data-testid="leverage-checkbox"]').click(LOAD_TIMEOUT)

/**
 * Fill in the create loan form. Assumes the form is already opened.
 */
export function writeCreateLoanForm({
  collateral,
  borrow,
  leverageEnabled,
  hasLeverage,
  waitForRoutes,
}: {
  collateral: Decimal
  borrow: Decimal
  leverageEnabled: boolean
  hasLeverage: boolean
  waitForRoutes?: boolean
}) {
  cy.get('[data-testid="borrow-debt-input"]', TRANSACTION_LOAD_TIMEOUT).should('be.visible')
  cy.get('[data-testid="borrow-collateral-input"] [data-testid="balance-value"]', TRANSACTION_LOAD_TIMEOUT).should(
    'be.visible',
  )
  getCollateralInput().type(collateral)
  getCollateralInput().blur()
  getMaxBorrowBalance().should('be.visible')
  getActionValue('borrow-health').should('equal', '∞')
  getBorrowInput().type(borrow)
  getBorrowInput().blur()
  getActionValue('borrow-health').should('not.equal', '∞')
  if (leverageEnabled) toggleLeverage()
  checkLeverageCheckbox({ leverageEnabled, hasLeverage })
  if (waitForRoutes) waitForRoutesLoaded({ submitButtonTestId: 'create-loan-submit-button' })
}

/**
 * Test the loan range slider by selecting max ltv and max borrow presets, checking for errors, and clearing them.
 */
export function checkLoanRangeSlider() {
  getMaxBorrowBalance().then($el => {
    const safeMax = $el.attr('data-value')
    cy.get(`[data-testid="loan-preset-${LoanPreset.MaxLtv}"]`).click()
    getBorrowInput().should('not.have.attr', 'data-value', safeMax)
    getMaxBorrowBalance().should('not.have.attr', 'data-value', safeMax)
    getMaxBorrowBalance(LOAD_TIMEOUT).click()
    cy.get(`[data-testid="loan-preset-${LoanPreset.Safe}"]`).click({ force: true }) // force, tooltip sometimes covers part of it
    getMaxBorrowBalance().should('have.attr', 'data-value', safeMax)
    getBorrowInput().should('have.attr', 'data-value', safeMax)
  })
}

export function submitLoanForm({
  form,
  message,
  expected = 'success',
  checkMessage = true,
}: {
  form: string
  message: string
  expected?: AlertColor
  checkMessage?: boolean
}) {
  cy.get(`[data-testid="${form}-submit-button"]`).click(LOAD_TIMEOUT)
  cy.get(`[data-testid="toast-${expected}"]`, TRANSACTION_LOAD_TIMEOUT).contains(message, TRANSACTION_LOAD_TIMEOUT)
  if (expected !== 'success') {
    return cy.get('[data-testid="loan-alert-error"]').should('be.visible')
  }
  if (!checkMessage) {
    return cy.get('[data-testid="loan-form-errors"]').should('not.exist')
  }
  return cy.get('[data-testid="loan-form-errors"]').should('not.exist')
}

/**
 * Submit the create loan form and wait for the button to be re-enabled.
 */
export const submitCreateLoanForm = ({
  checkMessage,
}: { expected?: 'success' | 'error'; checkMessage?: boolean } = {}) =>
  submitLoanForm({ form: 'create-loan', message: 'Loan created', checkMessage })
