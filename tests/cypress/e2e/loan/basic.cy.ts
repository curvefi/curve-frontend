describe('Basic Access Test', () => {
  it('should open the Loan DApp successfully', () => {
    cy.visit('/')
    cy.title().should('include', 'Markets')
  })
})
