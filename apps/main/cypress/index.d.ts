/// <reference types="Cypress" />

declare namespace Cypress {
  interface Window {
    ethereum?: any
  }

  interface Chainable {
    /**
     * Custom command to select DOM element by data-testid attribute.
     * @example cy.dataTestid('greeting')
     */
    dataTestid: typeof dataTestid

    /**
     * Custom command to select DOM element by data-testid attribute.
     * @example cy.connectWallet('greeting')
     */
    connectWallet: typeof connectWallet
  }
}
