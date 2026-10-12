import { setupDexPoolListV2Mocks } from '@cy/support/helpers/dex-pool-list-v2-mocks'
import { DESKTOP_VIEWPORT } from '@cy/support/helpers/dex-pools-list-v2.helpers'
import { TIMEOUTS, type TimeoutCategory } from '@cy/support/timeout-categories'
import { UnexpectedApiRequest } from '@cy/support/ui'
import { Chain } from '@primitives/network.utils'

const visitPoolList = (network: string, supportAlias: `@${string}`, category: TimeoutCategory) => {
  cy.viewport(...DESKTOP_VIEWPORT)
  cy.visitWithoutTestConnector(`dex/${network}/pools/`)
  cy.wait('@dex-v2-platforms', TIMEOUTS['mock.curveCore.platforms'])
  cy.wait('@dex-v2-prices-chains', TIMEOUTS['mock.prices.chains'])
  cy.wait(supportAlias, TIMEOUTS[category])
}

const expectUnsupportedPoolList = () => {
  cy.contains('Unable to retrieve pool list').should('be.visible')
  cy.contains('The pool list is not supported on chain').should('be.visible')
}

describe('V2 pool-list network support', () => {
  beforeEach(setupDexPoolListV2Mocks)

  it('shows the table error state without fetching pools for an unsupported full network', () => {
    cy.intercept(
      { method: 'GET', hostname: 'prices.curve.finance', pathname: '/v2/pools/chains/' },
      { body: { data: [] } },
    ).as('dex-v2-unsupported-pool-chains')

    visitPoolList('ethereum', '@dex-v2-unsupported-pool-chains', 'mock.prices.chains')

    expectUnsupportedPoolList()
    cy.get('@dex-v2-pools.all').should('have.length', 0)
  })

  it('shows the table error state without fetching pools for an unsupported Lite network', () => {
    cy.intercept(
      { method: 'GET', hostname: 'api2.curve.finance', pathname: `/get_pools/${Chain.Celo}` },
      UnexpectedApiRequest,
    ).as('dex-v2-unexpected-lite-pools')

    visitPoolList('celo', '@dex-v2-lite-pool-chains', 'mock.curveLite.platforms')

    expectUnsupportedPoolList()
    cy.get('@dex-v2-unexpected-lite-pools.all').should('have.length', 0)
  })
})
