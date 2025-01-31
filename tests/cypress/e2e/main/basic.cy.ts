describe('Basic Access Test', () => {
  ;['/', '/dex'].forEach((path) => {
    it(`should open the Main DApp successfully at ${path}`, () => {
      cy.visit(path)
      cy.title().should('include', 'Pools - Curve')
      cy.url().should('include', '/dex')
    })
  })
})
