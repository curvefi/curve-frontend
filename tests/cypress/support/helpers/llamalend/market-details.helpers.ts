import {
  DECIMAL_REGEX,
  getActionInfo,
  getActionValue,
  getMetricValue,
} from '@cy/support/helpers/llamalend/action-info.helpers'
import { clickTab } from '@cy/support/helpers/tabs'
import { TIMEOUTS, type TimeoutCategory } from '@cy/support/timeout-categories'
import { type Breakpoint } from '@cy/support/ui'
import { MarketRateType } from '@evm-ui/types/market'
import { recordValues } from '@primitives/objects.utils'

type MarketDetailsOptions = { breakpoint: Breakpoint; hasWallet: boolean; hasApi?: boolean }

const ADDRESS_PATTERN = /^0x[a-fA-F0-9]{40}$/

const shouldShowCanvas = (testId: string, category: TimeoutCategory) =>
  cy.get(`[data-testid="${testId}"] canvas`, TIMEOUTS[category]).should('be.visible')

const withMarketFormDrawer = <T>(
  breakpoint: Breakpoint | undefined,
  action: string,
  callback: () => Cypress.Chainable<T>,
) => {
  if (breakpoint !== 'mobile') return callback()

  cy.get(`[data-testid="mobile-form-action-${action}"]`, TIMEOUTS['ui.interaction']).click()
  cy.get('[data-testid="mobile-form-drawer"]', TIMEOUTS['ui.render']).should('be.visible')
  return callback()
}

const shouldLoadHistoricalBorrowRateChart = (category: TimeoutCategory) => {
  getMetricValue('historical-borrow-current-rate', category).should('match', DECIMAL_REGEX)
  shouldShowCanvas('historical-borrow-rate-chart', category)
}

const shouldLoadHistoricalSupplyRateChart = () => {
  getMetricValue('historical-supply-current-rate', 'mock.prices.snapshots').should('match', DECIMAL_REGEX)
  shouldShowCanvas('historical-supply-rate-chart', 'mock.prices.snapshots')
}

const shouldLoadRateBreakdown = (rateType: 'borrow' | 'supply', hasRateData: boolean) => {
  const card = cy.get(`[data-testid="${rateType}-rate-breakdown"]`, TIMEOUTS['ui.render']).should('be.visible')
  if (hasRateData) card.find('[data-testid="data-table"]', TIMEOUTS['llamalend.rates']).should('be.visible')
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
  cy.get('[data-testid="market-contracts-section"]', TIMEOUTS['ui.render']).should('be.visible')
  getActionValue('market-contract-collateral-token', 'llamalend.marketMetadata').should('match', ADDRESS_PATTERN)
  getActionValue('market-contract-borrow-token', 'llamalend.marketMetadata').should('match', ADDRESS_PATTERN)
  getActionValue('market-contract-amm', 'llamalend.marketMetadata').should('match', ADDRESS_PATTERN)
  if (hasVault) getActionValue('market-contract-vault', 'llamalend.marketMetadata').should('match', ADDRESS_PATTERN)
  getActionValue('market-contract-controller', 'llamalend.marketMetadata').should('match', ADDRESS_PATTERN)
  if (hasMonetaryPolicy)
    getActionValue('market-contract-monetary-policy', 'llamalend.marketMetadata').should('match', ADDRESS_PATTERN)
  if (hasOracle) getActionValue('market-contract-oracle', 'llamalend.marketMetadata').should('match', ADDRESS_PATTERN)
  getActionValue('market-id', 'llamalend.marketMetadata').should('not.equal', '-')
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
  cy.get('[data-testid="market-parameters-section"]', TIMEOUTS['ui.render']).should('be.visible')
  if (hasOnChainParameters) {
    getActionValue('market-param-amm-swap-fee', 'evm.contractRead').should('match', DECIMAL_REGEX)
    getActionValue('market-param-admin-fee', 'evm.contractRead').should('match', DECIMAL_REGEX)
    getActionValue('market-param-band-width-factor', 'evm.contractRead').should('match', DECIMAL_REGEX)
    getActionValue('market-param-loan-discount', 'evm.contractRead').should('match', DECIMAL_REGEX)
    getActionValue('market-param-liquidation-discount', 'evm.contractRead').should('match', DECIMAL_REGEX)
  }
  getActionValue('market-param-max-ltv', 'evm.contractRead').should('match', DECIMAL_REGEX)

  cy.get('[data-testid="market-price-oracle"]', TIMEOUTS['ui.render']).should('be.visible')
  if (hasOraclePrice) getActionValue('market-price-oracle', 'evm.contractRead').should('match', DECIMAL_REGEX)
  if (hasPricePerShare) getActionValue('market-price-per-share', 'evm.contractRead').should('match', DECIMAL_REGEX)
}

const shouldLoadMarketDetails = () => {
  cy.get('[data-testid^="detail-page-layout"]', TIMEOUTS['ui.render']).should('be.visible')
  getActionValue('market-available-liquidity', 'llamalend.liquidity').should('match', DECIMAL_REGEX)
  cy.get('[data-testid="market-advanced-details"]', TIMEOUTS['ui.render']).should('be.visible')
  cy.get('[data-testid="llamalend-market-faq"]').should('be.visible')
}

const PARTICIPANT_CARDS = {
  [MarketRateType.Borrow]: {
    testId: 'top-borrowers-card',
    metrics: ['market-total-borrowers', 'market-participants-total-debt'],
  },
  [MarketRateType.Supply]: {
    testId: 'top-suppliers-card',
    metrics: ['market-total-suppliers', 'market-participants-total-liquidity'],
  },
} satisfies Record<MarketRateType, { testId: string; metrics: string[] }>

const shouldLoadParticipantCard = (rateType: MarketRateType) => {
  const { testId, metrics } = PARTICIPANT_CARDS[rateType]
  cy.get(`[data-testid="${testId}"]`).should('be.visible')
  metrics.forEach(testId => {
    getMetricValue(testId, 'prices.activity').should('match', DECIMAL_REGEX)
  })
}

const shouldLoadLendMarketActivity = (rateType: MarketRateType) => {
  const [visible, hidden] = {
    [MarketRateType.Borrow]: ['market-activity', 'market-vault-activity'],
    [MarketRateType.Supply]: ['market-vault-activity', 'market-activity'],
  }[rateType]
  cy.get(`[data-testid="${visible}"] [data-testid="data-table"]`, TIMEOUTS['prices.activity']).should('be.visible')
  cy.get(`[data-testid="${hidden}"]`).should('not.exist')
  cy.get(`[data-testid="${visible}"] [data-testid="tab-events"]`).should('be.visible')
  cy.get('[data-testid="tab-trades"]').should(rateType === MarketRateType.Borrow ? 'be.visible' : 'not.exist')
  shouldLoadParticipantCard(rateType)
  recordValues(MarketRateType)
    .filter(type => type !== rateType)
    .forEach(type => {
      clickTab('market-participants-tab', type)
      shouldLoadParticipantCard(type)
    })
}

const shouldLoadBorrowDetails = ({
  breakpoint,
  hasWallet,
  hasApi = false,
  snapshots,
}: MarketDetailsOptions & { snapshots: TimeoutCategory }) => {
  cy.get(`[data-testid="no-position-${hasWallet ? 'borrow' : 'disconnected'}"]`, TIMEOUTS['ui.render']).should(
    'be.visible',
  )
  withMarketFormDrawer(breakpoint, 'create', () => {
    cy.get(`[data-testid="borrow-collateral-input"]`, TIMEOUTS['ui.render']).should('be.visible')
    cy.get(`[data-testid="borrow-debt-input"]`).should('be.visible')
    cy.get(`[data-testid="${hasWallet ? 'create-loan-submit-button' : 'form-market-page'}"]`)
    return cy.wrap(null)
  })
  cy.get(`[data-testid='no-position-disconnected']`).should(hasWallet ? 'not.exist' : 'be.visible')
  if (hasApi) {
    getActionValue('market-net-borrow-apr', 'llamalend.rates').should('match', DECIMAL_REGEX)
    shouldShowCanvas('market-price-chart', 'mock.prices.charts')
    shouldLoadHistoricalBorrowRateChart(snapshots)
  } else {
    getActionInfo('market-net-borrow-apr', 'llamalend.rates').should('not.exist')
  }
  shouldLoadMarketDetails()
}

export const shouldLoadLendBorrowDetails = ({ breakpoint, hasWallet, hasApi = true }: MarketDetailsOptions) => {
  shouldLoadBorrowDetails({ breakpoint, hasWallet, hasApi, snapshots: 'mock.prices.snapshots' })
  shouldLoadRateBreakdown('borrow', hasApi)
  clickTab('historical-rate-tab', MarketRateType.Supply)
  shouldLoadRateBreakdown('supply', hasApi)
  getActionValue('market-total-liquidity', 'llamalend.liquidity').should('match', DECIMAL_REGEX)
  if (hasApi) {
    shouldLoadHistoricalSupplyRateChart()
    shouldShowCanvas('interest-rate-utilization-chart', 'prices.charts')
    shouldLoadLendMarketActivity(MarketRateType.Borrow)
  }
  shouldLoadMarketContracts({ hasMonetaryPolicy: true, hasOracle: true, hasVault: true })
  shouldLoadMarketParameters({ hasOnChainParameters: hasWallet, hasOraclePrice: true, hasPricePerShare: false })
  if (hasApi && hasWallet) getActionValue('market-param-max-roe', 'evm.contractRead').should('match', DECIMAL_REGEX)
}

export const shouldLoadMintBorrowDetails = ({ breakpoint, hasWallet, hasApi = true }: MarketDetailsOptions) => {
  shouldLoadBorrowDetails({ breakpoint, hasWallet, hasApi, snapshots: 'prices.snapshots' })
  shouldLoadRateBreakdown('borrow', hasApi)
  cy.get('[data-testid="supply-rate-breakdown"]').should('not.exist')
  if (hasApi) {
    shouldShowCanvas('crvusd-price-chart', 'prices.charts')
    cy.get('[data-testid="market-activity"]', TIMEOUTS['prices.activity']).should('be.visible')
    shouldLoadParticipantCard(MarketRateType.Borrow)
    cy.get(`[data-testid="market-participants-tab-${MarketRateType.Supply}"]`).should('not.exist')
    // TODO: add back market total collateral metric
  }
  shouldLoadMarketContracts({ hasMonetaryPolicy: hasWallet, hasOracle: hasWallet, hasVault: false })
  shouldLoadMarketParameters({ hasOnChainParameters: hasWallet, hasOraclePrice: hasWallet, hasPricePerShare: false })
}

export const shouldLoadLendVaultDetails = ({ breakpoint, hasWallet, hasApi = true }: MarketDetailsOptions) => {
  withMarketFormDrawer(breakpoint, 'supply', () => {
    cy.get('[data-testid="supply-deposit-input"]', TIMEOUTS['ui.render']).should('be.visible')
    cy.get(`[data-testid="supply-deposit-submit-button"]`).should(hasWallet ? 'be.visible' : 'not.exist')
    return cy.wrap(null)
  })
  cy.get(`[data-testid="no-position-${hasWallet ? 'supply' : 'disconnected'}"]`, TIMEOUTS['ui.render']).should(
    'be.visible',
  )
  cy.get(`[data-testid="no-position-${hasWallet ? 'disconnected' : 'supply'}"]`).should('not.exist')
  shouldLoadRateBreakdown('supply', hasApi)
  getActionValue('market-total-liquidity', 'llamalend.liquidity').should('match', DECIMAL_REGEX)
  if (hasApi) {
    getActionValue('market-net-supply-apy', 'llamalend.rates').should('match', DECIMAL_REGEX)
    shouldLoadHistoricalSupplyRateChart()
    shouldShowCanvas('interest-rate-utilization-chart', 'prices.charts')
    shouldLoadLendMarketActivity(MarketRateType.Supply)
  } else {
    getActionInfo('market-net-supply-apy', 'llamalend.rates').should('not.exist')
  }
  clickTab('historical-rate-tab', MarketRateType.Borrow)
  shouldLoadRateBreakdown('borrow', hasApi)
  shouldLoadMarketContracts({ hasMonetaryPolicy: true, hasOracle: true, hasVault: true })
  shouldLoadMarketParameters({ hasOnChainParameters: hasWallet, hasOraclePrice: true, hasPricePerShare: hasWallet })
  shouldLoadMarketDetails()
}
