import { setupDexPoolListV2Mocks } from '@cy/support/helpers/dex-pool-list-v2-mocks'
import { DESKTOP_VIEWPORT } from '@cy/support/helpers/dex-pools-list-v2.helpers'
import { API_LOAD_TIMEOUT, UnexpectedApiRequest } from '@cy/support/ui'
import { Chain } from '@evm-ui/utils/network'

const visitPoolList = (network: string, supportAlias: `@${string}`) => {
  cy.viewport(...DESKTOP_VIEWPORT)
  cy.visitWithoutTestConnector(`dex/${network}/pools/`)
  cy.wait('@dex-v2-platforms', API_LOAD_TIMEOUT)
  cy.wait('@dex-v2-prices-chains', API_LOAD_TIMEOUT)
  cy.wait(supportAlias, API_LOAD_TIMEOUT)
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

    visitPoolList('ethereum', '@dex-v2-unsupported-pool-chains')

    expectUnsupportedPoolList()
    cy.get('@dex-v2-pools.all').should('have.length', 0)
  })

  it('shows the table error state without fetching pools for an unsupported Lite network', () => {
    cy.intercept(
      { method: 'GET', hostname: 'api2.curve.finance', pathname: `/get_pools/${Chain.Celo}` },
      UnexpectedApiRequest,
    ).as('dex-v2-unexpected-lite-pools')

    visitPoolList('celo', '@dex-v2-lite-pool-chains')

    expectUnsupportedPoolList()
    cy.get('@dex-v2-unexpected-lite-pools.all').should('have.length', 0)
  })
})
