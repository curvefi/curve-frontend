describe('Basic Access Test', () => {
  it('should open the Loan DApp successfully', () => {
    cy.visit('/loan')
    cy.title().should('include', 'Markets')
  })
})
