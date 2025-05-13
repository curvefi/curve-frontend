import { LOAD_TIMEOUT } from '@/support/ui'

describe('Basic Access Test', () => {
  ;['/', '/dex'].forEach((path) => {
    it(`should open the Main DApp successfully at ${path}`, () => {
      cy.visit(path)
      cy.title(LOAD_TIMEOUT).should('equal', 'Pools - Curve')
      cy.url().should('include', '/dex')
    })

    it(`should redirect from the old URL successfully at ${path}`, () => {
      cy.visit(`${path}#/ethereum/create-pool`)
      cy.title(LOAD_TIMEOUT).should('equal', 'Create Pool - Curve')
      cy.url().should('match', /http:\/\/localhost:\d+\/dex\/ethereum\/create-pool\/$/)
    })
  })
})
