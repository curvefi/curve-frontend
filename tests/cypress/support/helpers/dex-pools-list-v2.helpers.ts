import { PoolColumnId } from '@/dex/features/pool-list/columns'
import { API_LOAD_TIMEOUT } from '@cy/support/ui'
import { V2_POOL_FIXTURES } from './dex-pool-list-v2-mocks'

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
  cy.wait(['@dex-v2-prices-chains'], API_LOAD_TIMEOUT)
  if (network === 'taiko') {
    cy.wait('@dex-v2-lite-pool-chains', API_LOAD_TIMEOUT)
    cy.wait('@dex-v2-lite-pools', API_LOAD_TIMEOUT)
  } else {
    cy.wait('@dex-v2-pool-chains', API_LOAD_TIMEOUT)
    cy.wait('@dex-v2-pools', API_LOAD_TIMEOUT)
  }
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
    .get(`[data-testid="table-row-link-${address}"]`, API_LOAD_TIMEOUT)
    .should('exist')
    .closest('[data-testid^="data-table-row-"]')

export const getV2PoolCell = (address: string, columnId: PoolColumnId) =>
  getV2PoolRow(address).find(`[data-testid="data-table-cell-${columnId}"]`)

export const showV2PoolColumns = (columnIds: readonly PoolColumnId[]) => {
  for (const columnId of columnIds) {
    cy.get('[data-testid="btn-visibility-settings"]').click()
    cy.get(`[data-testid="visibility-toggle-${columnId}"]`)
      .should('be.visible')
      .find('input')
      .then($input => {
        if (!$input.is(':checked')) cy.wrap($input).check({ force: true })
      })
    cy.get('body').click(0, 0)
  }
}

export const getV2PoolExpandedPanel = (address: string) => getV2PoolRow(address).next('tr').should('be.visible')

export const expandV2PoolRow = (address: string) => {
  getV2PoolRow(address).find('[data-testid="expand-icon"]').click()
  return getV2PoolExpandedPanel(address)
}
