import { LOAD_TIMEOUT } from '@cy/support/ui'

type WalletOptions = { hasWallet: boolean }

export const shouldLoadMarketDetails = ({ hasWallet }: WalletOptions) => {
  cy.get('[data-testid^="detail-page-layout"]', LOAD_TIMEOUT).should('be.visible')
  if (!hasWallet) cy.get('[data-testid="navigation-connect-wallet"]').should('be.visible')
  cy.get('[data-testid="market-available-liquidity"]', LOAD_TIMEOUT).should('be.visible')
  cy.get('[data-testid="market-advanced-details"]', LOAD_TIMEOUT).should('be.visible')
  cy.get('[data-testid="market-total-borrowers"]', LOAD_TIMEOUT).should('be.visible')
  cy.get('[data-testid="llamalend-market-faq"]').should('be.visible')
}

export const shouldLoadBorrowDetails = ({ hasWallet }: WalletOptions) => {
  cy.get(`[data-testid="no-position-${hasWallet ? 'borrow' : 'disconnected'}"]`).should('be.visible')
  cy.get('[data-testid="borrow-collateral-input"]').should('be.visible')
  cy.get('[data-testid="borrow-debt-input"]').should('be.visible')
  cy.get(`[data-testid="${hasWallet ? 'create-loan-submit-button' : 'navigation-connect-wallet'}"]`).should(
    'be.visible',
  )
  cy.get('[data-testid="market-net-borrow-apr"]', LOAD_TIMEOUT).should('be.visible')
  cy.get('[data-testid="historical-borrow-rate-chart"]', LOAD_TIMEOUT).should('be.visible')
  shouldLoadMarketDetails({ hasWallet })
}

export const shouldLoadLendBorrowDetails = (options: WalletOptions) => {
  shouldLoadBorrowDetails(options)
  cy.get('[data-testid="historical-supply-rate-chart"]', LOAD_TIMEOUT).should('be.visible')
  cy.get('[data-testid="interest-rate-utilization-chart"]', LOAD_TIMEOUT).should('be.visible')
}

export const shouldLoadMintBorrowDetails = (options: WalletOptions) => {
  shouldLoadBorrowDetails(options)
  cy.get('[data-testid="crvusd-price-chart"]', LOAD_TIMEOUT).should('be.visible')
  cy.get('[data-testid="market-total-collateral"]', LOAD_TIMEOUT).should('be.visible')
}

export const shouldLoadLendVaultDetails = ({ hasWallet }: WalletOptions) => {
  cy.get('[data-testid="supply-deposit-input"]').should('be.visible')
  cy.get(`[data-testid="${hasWallet ? 'supply-deposit-submit-button' : 'navigation-connect-wallet'}"]`).should(
    'be.visible',
  )
  cy.get('[data-testid="market-net-supply-apy"]', LOAD_TIMEOUT).should('be.visible')
  cy.get('[data-testid="historical-supply-rate-chart"]', LOAD_TIMEOUT).should('be.visible')
  cy.get('[data-testid="interest-rate-utilization-chart"]', LOAD_TIMEOUT).should('be.visible')
  shouldLoadMarketDetails({ hasWallet })
}
