describe('Basic Access Test', () => {
  it('should open the Loan DApp successfully', () => {
    cy.visit('/crvusd')
    cy.title().should('include', 'Markets')
  })
})
