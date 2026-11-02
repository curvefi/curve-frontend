import { setupDexPoolListV2Mocks } from '@cy/support/helpers/dex-pool-list-v2-mocks'
import { DESKTOP_VIEWPORT, visitV2PoolList } from '@cy/support/helpers/dex-pools-list-v2.helpers'
import { TIMEOUTS, type TimeoutCategory } from '@cy/support/timeout-categories'
import { UnexpectedApiRequest } from '@cy/support/ui'
import { Chain } from '@primitives/network.utils'

const visitPoolList = (network: string, supportAlias: `@${string}`, category: TimeoutCategory) => {
  cy.viewport(...DESKTOP_VIEWPORT)
  cy.visitWithoutTestConnector(`dex/${network}/pools/`)
  cy.wait('@dex-v2-lite-pool-chains', TIMEOUTS['mock.curveLite.platforms'])
  cy.wait('@dex-v2-prices-chains', TIMEOUTS['mock.prices.chains'])
  cy.wait(supportAlias, TIMEOUTS[category])
}

const expectUnsupportedPoolList = () => {
  cy.contains('Unable to retrieve pool list').should('be.visible')
  cy.contains('The pool list is not supported on chain').should('be.visible')
}

const UNSUPPORTED_NETWORK_CHAINID = 987654321
const MOCK_NETWORKS_WITH_UNSUPPORTED = {
  body: {
    success: true,
    data: {
      platforms: { ethereum: [], 'unsupported-network': [] },
      platforms_metadata: {
        ethereum: {
          chain_id: Chain.Ethereum,
          name: 'Ethereum',
          rpc_url: 'https://ethereum-rpc.publicnode.com',
          explorer_base_url: 'https://etherscan.io/',
          is_mainnet: true,
          native_currency_symbol: 'ETH',
        },
        'unsupported-network': {
          chain_id: UNSUPPORTED_NETWORK_CHAINID,
          name: 'Unsupported Network',
          rpc_url: 'https://unsupported-network.invalid/rpc',
          explorer_base_url: 'https://unsupported-network.invalid/',
          is_mainnet: true,
          native_currency_symbol: 'FAKE',
        },
      },
    },
  },
}

describe('V2 pool-list network support', () => {
  beforeEach(setupDexPoolListV2Mocks)

  it('keeps Ethereum usable despite the presence of an unconfigured API network', () => {
    cy.intercept(
      { method: 'GET', hostname: 'api2.curve.finance', pathname: '/get_platforms' },
      MOCK_NETWORKS_WITH_UNSUPPORTED,
    ).as('dex-v2-lite-pool-chains')

    visitV2PoolList()
    cy.location('pathname').should('match', /^\/dex\/ethereum\/pools\/?$/)
    cy.get('[data-testid="error-title"]').should('not.exist')

    cy.get('header [data-testid="btn-change-chain"]').click()
    cy.get('[data-testid="missing-chain-config"]').should('be.visible').and('contain.text', 'unsupported-network')
    cy.get('[data-testid="menu-item-chain-unsupported-network"]')
      .scrollIntoView()
      .should('be.visible')
      .and('contain.text', `Chain ${UNSUPPORTED_NETWORK_CHAINID}`)
    cy.get('[role="dialog"] input[name="chainName"]').type('{esc}')
    cy.get('[role="dialog"]').should('not.exist')
  })

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
