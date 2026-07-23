import { PoolColumnId } from '@/dex/features/pool-list/columns'
import { API_LOAD_TIMEOUT } from '@cy/support/ui'
import { V2_POOL_FIXTURES } from './dex-pool-list-v2-mocks'
import { enableBeta } from './user-profile.helpers'

export const DESKTOP_VIEWPORT = [1200, 800] as const
export const MOBILE_VIEWPORT = [375, 800] as const

type V2PoolListNetwork = 'ethereum' | 'taiko'

export const visitV2PoolList = ({
  network = 'ethereum',
  viewport = DESKTOP_VIEWPORT,
}: {
  network?: V2PoolListNetwork
  viewport?: readonly [number, number]
} = {}) => {
  const isMobile = viewport[0] < 600

  cy.viewport(viewport[0], viewport[1])
  cy.visitWithoutTestConnector(`dex/${network}/pools/`)
  cy.wait('@dex-v2-platforms', API_LOAD_TIMEOUT)
  enableBeta(isMobile)
  cy.wait('@dex-v2-pool-chains', API_LOAD_TIMEOUT)
  cy.wait('@dex-v2-pools', API_LOAD_TIMEOUT)
  cy.wait('@dex-v2-merkl-curve', API_LOAD_TIMEOUT)

  if (!isMobile && network === 'ethereum') {
    cy.get(`[data-testid="data-table-header-${PoolColumnId.NetApy}"]`, API_LOAD_TIMEOUT).should('be.visible')
  } else {
    const { address } = network === 'taiko' ? V2_POOL_FIXTURES.lite : V2_POOL_FIXTURES.showcase
    const row = getV2PoolRow(address).should('be.visible')

    if (network === 'ethereum') row.find('[data-testid="pool-badges"]').should('be.visible')
  }
}

export const getV2PoolRow = (address: string) =>
  cy
    .get(`[data-testid="market-link-${address}"]`, API_LOAD_TIMEOUT)
    .should('exist')
    .closest('[data-testid^="data-table-row-"]')

export const getV2PoolCell = (address: string, columnId: PoolColumnId) =>
  getV2PoolRow(address).find(`[data-testid="data-table-cell-${columnId}"]`)
