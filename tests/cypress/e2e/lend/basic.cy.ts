describe('Basic Access Test', () => {
  it('should open the Lend DApp successfully', () => {
    cy.visit('/')
    cy.title().should('include', 'Lend')
  })
})
