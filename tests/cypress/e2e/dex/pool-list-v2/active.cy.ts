import { setupDexPoolListV2Mocks, V2_POOL_FIXTURES } from '@cy/support/helpers/dex-pool-list-v2-mocks'
import { getV2PoolRow, visitV2PoolList } from '@cy/support/helpers/dex-pools-list-v2.helpers'
import { oneViewport } from '@cy/support/ui'

const testCases = [oneViewport()]

testCases.forEach(([width, height, breakpoint]) => {
  it(`toggles Active on (${breakpoint}, ${width}x${height}) without a filter bar or refetching Lite pools`, () => {
    setupDexPoolListV2Mocks()
    visitV2PoolList({ network: 'taiko', viewport: [width, height] })
    const chip = () => cy.get('[data-testid="chip-active"]')
    const zeroTvlPool = () => cy.get(`[data-testid="table-row-link-${V2_POOL_FIXTURES.liteZeroTvl.address}"]`)

    chip().should('be.visible').and('have.attr', 'aria-pressed', 'true')
    zeroTvlPool().should('not.exist')
    getV2PoolRow(V2_POOL_FIXTURES.liteLowTvl.address).should('be.visible')
    cy.get('[data-testid="dex-pool-filters-collapsible"]').should('not.exist')

    for (const active of [false, true]) {
      chip().click().should('have.attr', 'aria-pressed', `${active}`)
      zeroTvlPool().should(active ? 'not.exist' : 'be.visible')
      cy.get('[data-testid^="data-table-row-"]').should('have.length', active ? 2 : 3)
      cy.get('[data-testid="dex-pool-filters-collapsible"]').should('not.exist')
    }
    cy.get('@dex-v2-lite-pools.all').should('have.length', 1)
    cy.get('@dex-v2-pools.all').should('have.length', 0)
  })
})
