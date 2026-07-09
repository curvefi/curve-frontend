import { DECIMAL_REGEX, getActionValue, getMetricValue } from '@cy/support/helpers/llamalend/action-info.helpers'
import { LOAD_TIMEOUT } from '@cy/support/ui'

type WalletOptions = { hasWallet: boolean }

const ADDRESS_PATTERN = /^0x[a-fA-F0-9]{40}$/

const shouldShowCanvas = (testId: string) =>
  cy.get(`[data-testid="${testId}"] canvas`, LOAD_TIMEOUT).should('be.visible')

const getMarketSectionNavTab = (section: string) => cy.get(`[data-testid="market-section-nav-${section}"]`)

const shouldShowMarketSection = (section: string) =>
  cy.get(`[data-testid="market-section-${section}"]`, LOAD_TIMEOUT).should('be.visible')

const shouldLoadMarketSectionNav = () => {
  cy.get('[data-testid="market-section-nav"]', LOAD_TIMEOUT).should('be.visible')
  getMarketSectionNavTab('advanced-details').should('be.visible')
  getMarketSectionNavTab('faqs').should('be.visible')
}

const shouldNavigateBorrowMarketSections = () => {
  getMarketSectionNavTab('position-details').should('be.visible')
  getMarketSectionNavTab('price-chart').should('be.visible').click()
  shouldShowMarketSection('price-chart')
  cy.get('[data-testid="tab-chart"]').should('have.attr', 'aria-selected', 'true')

  getMarketSectionNavTab('market-activity').should('be.visible').click()
  shouldShowMarketSection('price-chart')
  cy.get('[data-testid="tab-events"]').should('have.attr', 'aria-selected', 'true')

  getMarketSectionNavTab('historical-rates').should('be.visible').click()
  shouldShowMarketSection('historical-rates')

  getMarketSectionNavTab('advanced-details').click()
  shouldShowMarketSection('advanced-details')

  getMarketSectionNavTab('faqs').click()
  shouldShowMarketSection('faqs')
}

const shouldNavigateVaultMarketSections = ({ hasPosition }: { hasPosition: boolean }) => {
  getMarketSectionNavTab('price-chart').should('not.exist')
  getMarketSectionNavTab('market-activity').should('not.exist')
  getMarketSectionNavTab('position-details').should(hasPosition ? 'be.visible' : 'not.exist')

  getMarketSectionNavTab('historical-rates').should('be.visible').click()
  shouldShowMarketSection('historical-rates')

  getMarketSectionNavTab('advanced-details').click()
  shouldShowMarketSection('advanced-details')

  getMarketSectionNavTab('faqs').click()
  shouldShowMarketSection('faqs')
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

export const shouldLoadMarketDetails = () => {
  cy.get('[data-testid^="detail-page-layout"]', LOAD_TIMEOUT).should('be.visible')
  shouldLoadMarketSectionNav()
  getActionValue('market-available-liquidity').should('match', DECIMAL_REGEX)
  cy.get('[data-testid="market-advanced-details"]', LOAD_TIMEOUT).should('be.visible')
  getActionValue('market-total-borrowers').should('match', DECIMAL_REGEX)
  cy.get('[data-testid="llamalend-market-faq"]').should('be.visible')
}

export const shouldLoadBorrowDetails = ({ hasWallet }: WalletOptions) => {
  cy.get(`[data-testid="no-position-${hasWallet ? 'borrow' : 'disconnected'}"]`).should('be.visible')
  cy.get('[data-testid="borrow-collateral-input"]').should('be.visible')
  cy.get('[data-testid="borrow-debt-input"]').should('be.visible')
  cy.get(`[data-testid='no-position-disconnected']`).should(hasWallet ? 'not.exist' : 'be.visible')
  cy.get('[data-testid="create-loan-submit-button"]').should(hasWallet ? 'be.visible' : 'not.exist')
  getActionValue('market-net-borrow-apr').should('match', DECIMAL_REGEX)
  shouldShowCanvas('market-chart-and-activity')
  shouldLoadHistoricalBorrowRateChart()
  shouldLoadMarketDetails()
}

export const shouldLoadLendBorrowDetails = ({ hasWallet }: WalletOptions) => {
  shouldLoadBorrowDetails({ hasWallet })
  shouldLoadHistoricalSupplyRateChart()
  shouldShowCanvas('interest-rate-utilization-chart')
  shouldLoadMarketContracts({ hasMonetaryPolicy: true, hasOracle: true, hasVault: true })
  shouldLoadMarketParameters({ hasOnChainParameters: hasWallet, hasOraclePrice: true, hasPricePerShare: false })
  shouldNavigateBorrowMarketSections()
}

export const shouldLoadMintBorrowDetails = ({ hasWallet }: WalletOptions) => {
  shouldLoadBorrowDetails({ hasWallet })
  shouldShowCanvas('crvusd-price-chart')
  getActionValue('market-total-collateral').should('match', DECIMAL_REGEX)
  shouldLoadMarketContracts({ hasMonetaryPolicy: hasWallet, hasOracle: hasWallet, hasVault: false })
  shouldLoadMarketParameters({ hasOnChainParameters: hasWallet, hasOraclePrice: hasWallet, hasPricePerShare: false })
  shouldNavigateBorrowMarketSections()
}

export const shouldLoadLendVaultDetails = ({ hasWallet }: WalletOptions) => {
  cy.get('[data-testid="supply-deposit-input"]').should('be.visible')
  cy.get(`[data-testid='no-position-disconnected']`).should('not.exist')
  cy.get('[data-testid="supply-deposit-submit-button"]').should(hasWallet ? 'be.visible' : 'not.exist')
  getActionValue('market-net-supply-apy').should('match', DECIMAL_REGEX)
  shouldLoadHistoricalSupplyRateChart()
  shouldShowCanvas('interest-rate-utilization-chart')
  shouldLoadMarketContracts({ hasMonetaryPolicy: true, hasOracle: true, hasVault: true })
  shouldLoadMarketParameters({ hasOnChainParameters: hasWallet, hasOraclePrice: true, hasPricePerShare: hasWallet })
  shouldLoadMarketDetails()
  shouldNavigateVaultMarketSections({ hasPosition: hasWallet })
}
