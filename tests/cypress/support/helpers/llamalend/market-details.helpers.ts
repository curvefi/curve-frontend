import { DECIMAL_REGEX, getActionValue } from '@cy/support/helpers/llamalend/action-info.helpers'
import { LOAD_TIMEOUT } from '@cy/support/ui'

type WalletOptions = { hasWallet: boolean }

const ADDRESS_PATTERN = /^0x[a-fA-F0-9]{40}$/

const shouldShowCanvas = (testId: string) =>
  cy.get(`[data-testid="${testId}"] canvas`, LOAD_TIMEOUT).should('be.visible')

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

export const shouldLoadMarketDetails = ({ hasWallet }: WalletOptions) => {
  cy.get('[data-testid^="detail-page-layout"]', LOAD_TIMEOUT).should('be.visible')
  cy.get('[data-testid="no-position-disconnected"]').should(hasWallet ? 'not.exist' : 'be.visible')
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
  shouldShowCanvas('historical-borrow-rate-chart')
  shouldLoadMarketDetails({ hasWallet })
}

export const shouldLoadLendBorrowDetails = ({ hasWallet }: WalletOptions) => {
  shouldLoadBorrowDetails({ hasWallet })
  shouldShowCanvas('historical-supply-rate-chart')
  shouldShowCanvas('interest-rate-utilization-chart')
  shouldLoadMarketContracts({ hasMonetaryPolicy: true, hasOracle: true, hasVault: true })
  shouldLoadMarketParameters({ hasOnChainParameters: hasWallet, hasOraclePrice: true, hasPricePerShare: false })
}

export const shouldLoadMintBorrowDetails = ({ hasWallet }: WalletOptions) => {
  shouldLoadBorrowDetails({ hasWallet })
  shouldShowCanvas('crvusd-price-chart')
  getActionValue('market-total-collateral').should('match', DECIMAL_REGEX)
  shouldLoadMarketContracts({ hasMonetaryPolicy: hasWallet, hasOracle: hasWallet, hasVault: false })
  shouldLoadMarketParameters({ hasOnChainParameters: hasWallet, hasOraclePrice: hasWallet, hasPricePerShare: false })
}

export const shouldLoadLendVaultDetails = ({ hasWallet }: WalletOptions) => {
  cy.get('[data-testid="supply-deposit-input"]').should('be.visible')
  cy.get(`[data-testid='no-position-disconnected']`).should('not.exist')
  cy.get('[data-testid="supply-deposit-submit-button"]').should(hasWallet ? 'be.visible' : 'not.exist')
  getActionValue('market-net-supply-apy').should('match', DECIMAL_REGEX)
  shouldShowCanvas('historical-supply-rate-chart')
  shouldShowCanvas('interest-rate-utilization-chart')
  shouldLoadMarketContracts({ hasMonetaryPolicy: true, hasOracle: true, hasVault: true })
  shouldLoadMarketParameters({ hasOnChainParameters: hasWallet, hasOraclePrice: true, hasPricePerShare: hasWallet })
  shouldLoadMarketDetails({ hasWallet })
}
