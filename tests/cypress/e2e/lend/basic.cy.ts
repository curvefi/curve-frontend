describe('Basic Access Test', () => {
  it('should open the Lend DApp successfully', () => {
    cy.visit('/lend')
    cy.title().should('include', 'Lend')
  })
})
