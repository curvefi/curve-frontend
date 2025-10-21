describe('DEX Swap', () => {
  const FROM_USDT = '0xdac17f958d2ee523a2206206994597c13d831ec7'
  const TO_ETH = '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE'

  it('shows quotes via router API when disconnected', () => {
    cy.intercept('GET', '/api/router/optimal-route*').as('optimalRoute')

    // Visit swap page with explicit tokens to avoid redirects
    cy.visit(`/dex/ethereum/swap?from=${FROM_USDT}&to=${TO_ETH}`)

    // Enter an amount to trigger quote
    cy.get('[data-testid="from-amount"]').should('be.visible')
    cy.get('[data-testid="from-amount"]').type('1')

    // Wait for the optimal route API to be called and UI to update
    cy.wait('@optimalRoute')

    // Expect exchange rate and price impact info to render
    cy.contains('Exchange rate').should('be.visible')
    cy.contains('Price impact').should('be.visible')

    // Action area should show Connect Wallet instead of Approve/Swap buttons
    cy.contains('Connect Wallet').should('be.visible')
    cy.get('[data-testid="swap"]').should('not.exist')
  })
})
