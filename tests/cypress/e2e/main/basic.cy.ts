import { oneOf } from '@cy/support/generators'
import { LOAD_TIMEOUT } from '@cy/support/ui'

describe('Basic Access Test', () => {
  const path = oneOf('/', '/dex')

  it('should support default networks if the lite API is offline', () => {
    cy.intercept(`https://api-core.curve.finance/v1/getPlatforms`, { status: 500 }).as('error')
    cy.visit('/dex/corn/pools')
    cy.wait('@error', LOAD_TIMEOUT)
    cy.title(LOAD_TIMEOUT).should('equal', 'Pools - Curve')
    cy.get('[data-testid="error-title"]').should('not.exist')
    cy.url().should('include', '/dex/ethereum/pools')
  })

  it(`should open the Main DApp successfully at ${path}`, () => {
    cy.visit(path)
    cy.title(LOAD_TIMEOUT).should('equal', 'Pools - Curve')
    cy.url().should('include', '/dex')
  })

  it(`should redirect from the old URL successfully at ${path}`, () => {
    cy.visit(`${path}#/ethereum/create-pool`)
    cy.title(LOAD_TIMEOUT).should('equal', 'Create Pool - Curve')
    cy.url().should('match', /http:\/\/localhost:\d+\/dex\/ethereum\/create-pool\/?$/)
  })

  it('should redirect from the old integrations URL successfully', () => {
    cy.visit(`${path.replace('/', '')}${oneOf('', '#')}/integrations`)
    cy.title(LOAD_TIMEOUT).should('equal', 'Integrations - Curve')
    cy.url().should('match', /http:\/\/localhost:\d+\/dex\/ethereum\/integrations\/?$/)
  })

  it('should show an error page on 404', () => {
    cy.visit('/non-existing-page', { failOnStatusCode: false })
    cy.get('[data-testid="error-subtitle"]').should('contain.text', 'Page Not Found')
  })

  it('should load for lite networks', () => {
    cy.visit('/dex/corn/pools')
    cy.title(LOAD_TIMEOUT).should('equal', 'Pools - Curve')
    cy.url().should('include', '/dex/corn/pools')
    cy.contains('CORN/wBTCN', LOAD_TIMEOUT).should('be.visible')
  })

  it('applies a DEX filter chip and updates filters state', () => {
    // Go to a standard network pools page
    cy.visit('/dex/ethereum/pools')
    cy.title(LOAD_TIMEOUT).should('equal', 'Pools - Curve')
    cy.get('[data-testid="data-table"]', LOAD_TIMEOUT).should('exist')

    // Record initial row count
    cy.get('[data-testid^="data-table-row-"]').then(($rowsBefore) => {
      const countBefore = $rowsBefore.length

      const clickUsdChip = () => cy.contains('USD', LOAD_TIMEOUT).first().click({ force: true })

      // On mobile, open the drawer first; otherwise click directly
      cy.get('body').then(($body) => {
        if ($body.find('[data-testid="btn-drawer-filter-dex-pools"]').length) {
          cy.get('[data-testid="btn-drawer-filter-dex-pools"]').click()
          cy.get('[data-testid="drawer-filter-menu-dex-pools"]').should('be.visible')
        }
        clickUsdChip()
      })

      // Expect localStorage filters to contain the PoolTags filter with value 'usd'
      cy.window().then((win) => {
        const stored = win.localStorage.getItem('table-filters-dex-pool-list')
        expect(stored, 'filters are stored in localStorage').to.be.a('string')
        const parsed = JSON.parse(stored!) as Array<{ id: string; value: unknown }>
        const tags = parsed.find((f) => f.id === 'tags')
        expect(tags?.value).to.eq('usd')
      })

      // Row count should not increase; it often decreases when filtering
      cy.get('[data-testid^="data-table-row-"]').should(($rowsAfter) => {
        expect($rowsAfter.length).to.be.lte(countBefore)
      })
    })
  })
})
