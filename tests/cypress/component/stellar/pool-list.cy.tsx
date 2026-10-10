import { StellarApp } from '@/stellar/App'
import { STELLAR_CONTRACT_PATTERN, type StellarContract } from '@/stellar/features/connect-wallet/address'
import { router } from '@/stellar/routes'
import { StellarUrls } from '@/stellar/routes/routes'
import { oneOf } from '@cy/support/generators'
import { expandFirstRowOnMobile, openDrawer, withExpandedPanelDrawer } from '@cy/support/helpers/data-table.helpers'
import { TIMEOUTS } from '@cy/support/timeout-categories'
import { oneViewport } from '@cy/support/ui'
import { PoolColumnId } from '@ui/features/pool-list/columns/columns.enum'
import { queryClient } from '@ui/features/queries/query-client'

const NETWORK = 'stellar-testnet'
const POOL_LIST_URL = StellarUrls.poolList({ network: NETWORK })
const poolLinks = () => cy.get('[data-testid^="table-row-link-"]', TIMEOUTS['curveLite.pools'])
const search = () => cy.get('[data-testid="table-text-search-dex-pool-list"] input')

const testCases = [oneViewport()]

/**
 * Mount the production app and navigate using its browser history, routes, and providers.
 * This should be an e2e test,
 **/
const mountStellarApp = (path: string) => {
  cy.mount(<StellarApp />)
  cy.then(() => router.navigate({ to: path }))
  cy.get('[data-testid="data-table"]', TIMEOUTS['ui.render']).should('be.visible')
}

testCases.forEach(([width, height, breakpoint]) => {
  describe(`Stellar pool list (${breakpoint}, ${width}x${height})`, () => {
    beforeEach(() => {
      queryClient.clear()
      cy.clearLocalStorage()
      cy.viewport(width, height)
    })

    it('redirects the app entry to the mainnet pool list', () => {
      mountStellarApp('/')
      cy.location('pathname').should('equal', StellarUrls.poolList({ network: 'stellar' }))
      // Mainnet is empty while the backend rolls out support.
      cy.get(`[data-testid="dex-pool-empty-state-no-results"]`, TIMEOUTS['curveLite.pools']).should('be.visible')
    })

    it('loads pools, searches by address, and resets an empty search', () => {
      mountStellarApp(POOL_LIST_URL)
      poolLinks().then($links => {
        const count = $links.length
        const href = $links.first().attr('href')!
        const address = href.split('/').at(-1)!

        search().type(address)
        poolLinks().should('have.length', 1).and('have.attr', 'href', href)
        search().clear()
        search().type('zzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzz')
        cy.get(`[data-testid="dex-pool-empty-state-reset"]`).should('be.visible')
        search().clear()
        search().should('have.value', '')
        poolLinks().should('have.length', count)
      })
    })

    it('sorts the list by TVL', () => {
      mountStellarApp(`${POOL_LIST_URL}?sort=${PoolColumnId.NetRate}`)
      poolLinks().should('exist')
      openDrawer(breakpoint, 'sort')
      if (breakpoint === 'mobile') {
        cy.get(`[data-testid="drawer-sort-menu-dex-pools"] li[value="${PoolColumnId.Tvl}"]`).click()
        cy.get('[data-testid="drawer-sort-menu-dex-pools"]').should('not.be.visible')
      } else {
        cy.get(`[data-testid="data-table-header-${PoolColumnId.Tvl}"]`).click()
      }
      cy.location('search').should('include', 'sort=-tvl')
      cy.get(`[data-testid="data-table-cell-${PoolColumnId.Tvl}"]`).first().should('be.visible')

      if (breakpoint !== 'mobile') {
        cy.get(`[data-testid="data-table-header-${PoolColumnId.Tvl}"]`).click()
        cy.location('search').should('include', 'sort=tvl')
      }
    })

    it('shows TVL and tokens with only the supported Lite metrics', () => {
      mountStellarApp(POOL_LIST_URL)
      poolLinks().should('exist')
      cy.get(`[data-testid="data-table-cell-${PoolColumnId.Tvl}"]`).first().should('be.visible').and('not.be.empty')
      expandFirstRowOnMobile(breakpoint)
      if (breakpoint === 'mobile') {
        cy.get('[data-testid="data-table-expansion-row"]').within(() => {
          cy.get('[data-testid="pool-tvl-value"]').should('be.visible')
          cy.get('[data-testid="pool-volume-value"]').should('not.exist')
        })
      } else {
        cy.get('[data-testid="btn-visibility-settings"]').click()
        cy.get('[data-testid="visibility-settings-popover"]').should('be.visible')
        cy.get(`[data-testid="visibility-toggle-${PoolColumnId.Tokens}"] input`).check()
        for (const column of [
          PoolColumnId.Volume,
          PoolColumnId.BaseRate,
          PoolColumnId.WeeklyBaseRate,
          PoolColumnId.Age,
        ]) {
          cy.get(`[data-testid="visibility-toggle-${column}"]`).should('not.exist')
        }
        cy.get('body').click(0, 0)
      }
      cy.get('[data-testid="pool-tokens"]').first().should('be.visible').and('not.be.empty')
      for (const column of [
        PoolColumnId.Volume,
        PoolColumnId.BaseRate,
        PoolColumnId.WeeklyBaseRate,
        PoolColumnId.Age,
      ]) {
        cy.get(`[data-testid="data-table-cell-${column}"]`).should('not.exist')
      }
    })

    it('navigates from the pool list to a pool', () => {
      mountStellarApp(POOL_LIST_URL)
      poolLinks().should('exist')
      cy.get('[data-testid^="data-table-row-"]').first().click()
      if (breakpoint === 'mobile') {
        const action = oneOf('deposit', 'withdraw', 'swap')
        if (action === 'swap') {
          withExpandedPanelDrawer(breakpoint, () =>
            cy.get('[data-testid="expanded-panel-actions-menu"]').contains('a', 'Swap').click(),
          )
        } else {
          cy.get('[data-testid="data-table-expansion-row"]')
            .contains('a', { deposit: 'Deposit', withdraw: 'Withdraw' }[action])
            .click()
        }
      }

      const pool = STELLAR_CONTRACT_PATTERN.source.slice(1, -1) as StellarContract
      cy.location('pathname').should('match', new RegExp(`^${StellarUrls.pool({ network: NETWORK, pool })}$`))
    })
  })
})
