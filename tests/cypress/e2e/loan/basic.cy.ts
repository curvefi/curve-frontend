describe('Basic Access Test', () => {
  it('should open the crvUSD DApp successfully', () => {
    cy.visit('/crvusd')
    cy.title().should('include', 'Markets')
  })
})
