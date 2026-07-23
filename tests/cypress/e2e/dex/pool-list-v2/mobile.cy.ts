import { setupDexPoolListV2Mocks, V2_POOL_FIXTURES } from '@cy/support/helpers/dex-pool-list-v2-mocks'
import { MOBILE_VIEWPORT, getV2PoolRow, visitV2PoolList } from '@cy/support/helpers/dex-pools-list-v2.helpers'

const EXPANDED_PANEL = '[data-testid="data-table-expansion-row"]'

describe('V2 pool-list mobile panels', () => {
  beforeEach(() => setupDexPoolListV2Mocks())

  it('shows the full-network metrics with the mobile-specific APY presentation', () => {
    visitV2PoolList({ viewport: MOBILE_VIEWPORT })
    getV2PoolRow(V2_POOL_FIXTURES.showcase.address).find('[data-testid="expand-icon"]').click()

    cy.get(EXPANDED_PANEL)
      .should('be.visible')
      .within(() => {
        for (const label of [
          'Net APY',
          'Base APY',
          'Weekly Base APY',
          'Rewards APY',
          'Gauge APY',
          'Points',
          '24h Volume',
          'TVL',
          'Creation Date',
        ]) {
          cy.contains(new RegExp(`^${label}$`)).should('be.visible')
        }

        cy.get('[data-testid="pool-net-apy"]').should('contain.text', '20.70%').find('img').should('not.exist')
        cy.get('[data-testid="pool-gauge-apy"]')
          .should('contain.text', '5.12%')
          .and('contain.text', '\u2192')
          .and('contain.text', '13.30%')
          .find('img')
          .should('not.exist')
        cy.get('[data-testid="pool-base-apy-value"]').should('contain.text', '10.51%')
        cy.get('[data-testid="pool-weekly-base-apy-value"]').should('contain.text', '22.09%')
        cy.get('[data-testid="pool-rewards-apy"]').should('contain.text', '5.06%')
        cy.get('[data-testid="pool-points"]').should('not.have.text', '-')
        cy.get('[data-testid="pool-creation-date"]').should('not.have.text', '-')
      })
  })

  it('shows only the supported reward metrics on a Lite network', () => {
    visitV2PoolList({ network: 'taiko', viewport: MOBILE_VIEWPORT })
    getV2PoolRow(V2_POOL_FIXTURES.lite.address).find('[data-testid="expand-icon"]').click()

    cy.get(EXPANDED_PANEL)
      .should('be.visible')
      .within(() => {
        for (const label of ['Rewards APY', 'Points', 'TVL', 'Creation Date']) {
          cy.contains(new RegExp(`^${label}$`)).should('be.visible')
        }
        for (const label of ['Net APY', 'Base APY', 'Weekly Base APY', 'Gauge APY']) {
          cy.contains(new RegExp(`^${label}$`)).should('not.exist')
        }

        cy.get('[data-testid="pool-rewards-apy"]').should('contain.text', '%')
        cy.get('[data-testid="pool-points"]').should('not.have.text', '-')
        cy.get('[data-testid="pool-creation-date"]').should('not.have.text', '-')
      })
  })
})
