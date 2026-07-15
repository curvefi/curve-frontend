import {
  DECIMAL_REGEX,
  getActionInfo,
  getActionValue,
  getMetricValue,
} from '@cy/support/helpers/llamalend/action-info.helpers'
import { API_LOAD_TIMEOUT, type Breakpoint, LOAD_TIMEOUT } from '@cy/support/ui'

type MarketDetailsOptions = { breakpoint: Breakpoint; hasWallet: boolean; hasApi?: boolean }

const ADDRESS_PATTERN = /^0x[a-fA-F0-9]{40}$/

const shouldShowCanvas = (testId: string) =>
  cy.get(`[data-testid="${testId}"] canvas`, API_LOAD_TIMEOUT).should('be.visible')

const shouldBeVisibleAfterScroll = (testId: string) => {
  cy.get(`[data-testid="${testId}"]`, LOAD_TIMEOUT).filter(':visible').last().as('element')
  cy.get('@element').scrollIntoView()
  cy.get('@element').should('be.visible')
}

const withMarketFormDrawer = <T>(
  breakpoint: Breakpoint | undefined,
  action: string,
  callback: () => Cypress.Chainable<T>,
) => {
  if (breakpoint !== 'mobile') return callback()

  cy.get(`[data-testid="mobile-form-action-${action}"]`, LOAD_TIMEOUT).click()
  cy.get('[data-testid="mobile-form-drawer"]', LOAD_TIMEOUT).should('be.visible')
  return callback()
}

const shouldLoadHistoricalBorrowRateChart = () => {
  getMetricValue('historical-borrow-current-rate').should('match', DECIMAL_REGEX)
  shouldShowCanvas('historical-borrow-rate-chart')
}

const shouldLoadHistoricalSupplyRateChart = () => {
  getMetricValue('historical-supply-current-rate').should('match', DECIMAL_REGEX)
  shouldShowCanvas('historical-supply-rate-chart')
}

const shouldLoadMarketContracts = ({
  hasMonetaryPolicy,
  hasOracle,
  hasVault,
}: {
  hasMonetaryPolicy: boolean
  hasOracle: boolean
  hasVault: boolean
}) => {
  cy.get('[data-testid="market-contracts-section"]', LOAD_TIMEOUT).should('be.visible')
  getActionValue('market-contract-collateral-token').should('match', ADDRESS_PATTERN)
  getActionValue('market-contract-borrow-token').should('match', ADDRESS_PATTERN)
  getActionValue('market-contract-amm').should('match', ADDRESS_PATTERN)
  if (hasVault) getActionValue('market-contract-vault').should('match', ADDRESS_PATTERN)
  getActionValue('market-contract-controller').should('match', ADDRESS_PATTERN)
  if (hasMonetaryPolicy) getActionValue('market-contract-monetary-policy').should('match', ADDRESS_PATTERN)
  if (hasOracle) getActionValue('market-contract-oracle').should('match', ADDRESS_PATTERN)
}

const shouldLoadMarketParameters = ({
  hasOnChainParameters,
  hasOraclePrice,
  hasPricePerShare,
}: {
  hasOnChainParameters: boolean
  hasOraclePrice: boolean
  hasPricePerShare: boolean
}) => {
  cy.get('[data-testid="market-parameters-section"]', LOAD_TIMEOUT).should('be.visible')
  if (hasOnChainParameters) {
    getActionValue('market-param-amm-swap-fee').should('match', DECIMAL_REGEX)
    getActionValue('market-param-admin-fee').should('match', DECIMAL_REGEX)
    getActionValue('market-param-band-width-factor').should('match', DECIMAL_REGEX)
    getActionValue('market-param-loan-discount').should('match', DECIMAL_REGEX)
    getActionValue('market-param-liquidation-discount').should('match', DECIMAL_REGEX)
  }
  getActionValue('market-param-max-ltv').should('match', DECIMAL_REGEX)

  cy.get('[data-testid="market-prices-section"]', LOAD_TIMEOUT).should('be.visible')
  if (hasOraclePrice) getActionValue('market-price-oracle').should('match', DECIMAL_REGEX)
  if (hasPricePerShare) getActionValue('market-price-per-share').should('match', DECIMAL_REGEX)

  cy.get('[data-testid="market-id-section"]', LOAD_TIMEOUT).should('be.visible')
  getActionValue('market-id').should('not.equal', '-')
}

const shouldLoadMarketDetails = ({ hasApi }: { hasApi: boolean }) => {
  cy.get('[data-testid^="detail-page-layout"]', LOAD_TIMEOUT).should('be.visible')
  getActionValue('market-available-liquidity').should('match', DECIMAL_REGEX)
  cy.get('[data-testid="market-advanced-details"]', LOAD_TIMEOUT).should('be.visible')
  if (hasApi) {
    getActionValue('market-total-borrowers').should('match', DECIMAL_REGEX)
  } else {
    getActionInfo('market-total-borrowers').should('not.exist')
  }
  cy.get('[data-testid="llamalend-market-faq"]').should('be.visible')
}

const shouldLoadBorrowDetails = ({ breakpoint, hasWallet, hasApi = false }: MarketDetailsOptions) => {
  cy.get(`[data-testid="no-position-${hasWallet ? 'borrow' : 'disconnected'}"]`, LOAD_TIMEOUT).should('be.visible')
  withMarketFormDrawer(breakpoint, 'create', () => {
    cy.get('[data-testid="borrow-collateral-input"]').should('be.visible')
    cy.get('[data-testid="borrow-debt-input"]').should('be.visible')
    shouldBeVisibleAfterScroll(hasWallet ? 'create-loan-submit-button' : 'form-market-page')
    return cy.wrap(null)
  })
  cy.get(`[data-testid='no-position-disconnected']`).should(hasWallet ? 'not.exist' : 'be.visible')
  if (hasApi) {
    getActionValue('market-net-borrow-apr').should('match', DECIMAL_REGEX)
    shouldShowCanvas('market-chart-and-activity')
    shouldLoadHistoricalBorrowRateChart()
  } else {
    getActionInfo('market-net-borrow-apr').should('not.exist')
  }
  shouldLoadMarketDetails({ hasApi })
}

export const shouldLoadLendBorrowDetails = ({ breakpoint, hasWallet, hasApi = true }: MarketDetailsOptions) => {
  shouldLoadBorrowDetails({ breakpoint, hasWallet, hasApi })
  getActionValue('market-total-liquidity').should('match', DECIMAL_REGEX)
  if (hasApi) {
    shouldLoadHistoricalSupplyRateChart()
    shouldShowCanvas('interest-rate-utilization-chart')
  }
  shouldLoadMarketContracts({ hasMonetaryPolicy: true, hasOracle: true, hasVault: true })
  shouldLoadMarketParameters({ hasOnChainParameters: hasWallet, hasOraclePrice: true, hasPricePerShare: false })
}

export const shouldLoadMintBorrowDetails = ({ breakpoint, hasWallet, hasApi = true }: MarketDetailsOptions) => {
  shouldLoadBorrowDetails({ breakpoint, hasWallet, hasApi })
  if (hasApi) {
    shouldShowCanvas('crvusd-price-chart')
    getActionValue('market-total-collateral').should('match', DECIMAL_REGEX)
  }
  shouldLoadMarketContracts({ hasMonetaryPolicy: hasWallet, hasOracle: hasWallet, hasVault: false })
  shouldLoadMarketParameters({ hasOnChainParameters: hasWallet, hasOraclePrice: hasWallet, hasPricePerShare: false })
}

export const shouldLoadLendVaultDetails = ({ breakpoint, hasWallet, hasApi = true }: MarketDetailsOptions) => {
  withMarketFormDrawer(breakpoint, 'supply', () => {
    cy.get('[data-testid="supply-deposit-input"]', LOAD_TIMEOUT).should('be.visible')
    if (hasWallet) {
      shouldBeVisibleAfterScroll('supply-deposit-submit-button')
    } else {
      cy.get('[data-testid="supply-deposit-submit-button"]').should('not.exist')
    }
    return cy.wrap(null)
  })
  cy.get(`[data-testid^='no-position']`).should('not.exist')
  getActionValue('market-total-liquidity').should('match', DECIMAL_REGEX)
  if (hasApi) {
    getActionValue('market-net-supply-apy').should('match', DECIMAL_REGEX)
    shouldLoadHistoricalSupplyRateChart()
    shouldShowCanvas('interest-rate-utilization-chart')
  } else {
    getActionInfo('market-net-supply-apy').should('not.exist')
  }
  shouldLoadMarketContracts({ hasMonetaryPolicy: true, hasOracle: true, hasVault: true })
  shouldLoadMarketParameters({ hasOnChainParameters: hasWallet, hasOraclePrice: true, hasPricePerShare: hasWallet })
  shouldLoadMarketDetails({ hasApi })
}
