describe('Basic Access Test', () => {
  it('should open the DAO DApp successfully', () => {
    cy.visit('/')
    cy.title().should('include', 'Proposals')
  })
})
