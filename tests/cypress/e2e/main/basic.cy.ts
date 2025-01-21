describe('Basic Access Test', () => {
  it('should open the Main DApp successfully', () => {
    cy.visit('/')
    cy.title().should('include', 'Swap')
  })
})
