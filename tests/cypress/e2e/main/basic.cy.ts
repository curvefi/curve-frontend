import { oneOf } from '@cy/support/generators'
import { LOAD_TIMEOUT } from '@cy/support/ui'

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

    it('should redirect from the old integrations URL successfully', () => {
      cy.visit(`${path.replace('/', '')}${oneOf('', '#')}/integrations`)
      cy.title(LOAD_TIMEOUT).should('equal', 'Integrations - Curve')
      cy.url().should('match', /http:\/\/localhost:\d+\/dex\/ethereum\/integrations\/$/)
    })
  })
})
