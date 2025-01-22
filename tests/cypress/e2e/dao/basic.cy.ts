describe('Basic Access Test', () => {
  it('should open the DAO DApp successfully', () => {
    cy.visit('/dao')
    cy.title().should('include', 'Proposals')
  })
})
