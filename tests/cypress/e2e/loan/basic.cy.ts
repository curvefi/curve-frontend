describe('Basic Access Test', () => {
  it('should open the crvUSD DApp successfully', () => {
    cy.visit('/crvusd')
    cy.title().should('include', 'Markets')
  })

  it(`should redirect from the old URL successfully`, () => {
    cy.visit(`/crvusd/#/ethereum/scrvUSD`)
    cy.title().should('equal', 'Savings crvUSD - Curve')
    cy.url().should('match', /http:\/\/localhost:\d+\/crvusd\/ethereum\/scrvUSD\/$/)
  })
})
