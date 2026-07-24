import { PoolColumnId } from '@/dex/features/pool-list/columns'
import { setupDexPoolListV2Mocks, V2_POOL_FIXTURES } from '@cy/support/helpers/dex-pool-list-v2-mocks'
import {
  DESKTOP_VIEWPORT,
  getV2PoolCell,
  getV2PoolRow,
  visitV2PoolList,
} from '@cy/support/helpers/dex-pools-list-v2.helpers'

const expectHeaderOrder = (expected: PoolColumnId[]) =>
  cy.get('[data-testid="data-table-head"] [data-testid^="data-table-header-"]').should($headers => {
    const actual = [...$headers].map(header => header.dataset.testid?.replace('data-table-header-', ''))

    expect(actual).to.deep.equal(expected)
  })

const DEFAULT_FULL_COLUMNS = [PoolColumnId.PoolName, PoolColumnId.NetApy, PoolColumnId.Volume, PoolColumnId.Tvl]

const OPTIONAL_FULL_COLUMNS = [
  PoolColumnId.BaseApy,
  PoolColumnId.WeeklyBaseApy,
  PoolColumnId.RewardsApy,
  PoolColumnId.GaugeApy,
  PoolColumnId.Points,
  PoolColumnId.CreationDate,
]

describe('V2 pool-list columns', () => {
  beforeEach(() => setupDexPoolListV2Mocks())

  it('shows the default columns and reveals optional columns in their defined order', () => {
    visitV2PoolList({ viewport: DESKTOP_VIEWPORT })

    expectHeaderOrder(DEFAULT_FULL_COLUMNS)
    for (const columnId of OPTIONAL_FULL_COLUMNS) {
      cy.get(`[data-testid="data-table-header-${columnId}"]`).should('not.exist')
    }

    cy.get('[data-testid="btn-visibility-settings"]').click()
    for (const columnId of OPTIONAL_FULL_COLUMNS) {
      cy.get(`[data-testid="visibility-toggle-${columnId}"]`).should('exist').click()
    }
    cy.get('body').click(0, 0)

    expectHeaderOrder([
      PoolColumnId.PoolName,
      PoolColumnId.NetApy,
      PoolColumnId.BaseApy,
      PoolColumnId.WeeklyBaseApy,
      PoolColumnId.RewardsApy,
      PoolColumnId.GaugeApy,
      PoolColumnId.Points,
      PoolColumnId.Volume,
      PoolColumnId.Tvl,
      PoolColumnId.CreationDate,
    ])
    getV2PoolCell(V2_POOL_FIXTURES.showcase.address, PoolColumnId.WeeklyBaseApy).should('contain.text', '22.09%')
    const expectedCreationDate = new Intl.DateTimeFormat(undefined, {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    }).format(new Date(V2_POOL_FIXTURES.showcase.creation_date! * 1000))
    getV2PoolCell(V2_POOL_FIXTURES.showcase.address, PoolColumnId.CreationDate)
      .find('[data-testid="pool-creation-date"]')
      .should('have.text', expectedCreationDate)
    getV2PoolCell(V2_POOL_FIXTURES.killed.address, PoolColumnId.CreationDate)
      .find('[data-testid="pool-creation-date"]')
      .should('have.text', '-')
  })

  it('shows only the supported default columns on a Lite network', () => {
    visitV2PoolList({ network: 'taiko', viewport: DESKTOP_VIEWPORT })

    expectHeaderOrder([PoolColumnId.PoolName, PoolColumnId.Volume, PoolColumnId.Tvl])
  })

  it('classifies representative pool types and adds the Metapool badge', () => {
    visitV2PoolList({ viewport: DESKTOP_VIEWPORT })

    getV2PoolRow(V2_POOL_FIXTURES.showcase.address)
      .find('[data-testid="pool-badges"] [data-testid^="badge-pool-"]')
      .should($badges => {
        expect([...$badges].map(badge => badge.dataset.testid)).to.deep.equal([
          'badge-pool-type-stable',
          'badge-pool-metapool',
        ])
      })

    getV2PoolRow(V2_POOL_FIXTURES.volatile.address)
      .find('[data-testid="badge-pool-type-volatile"]')
      .should('have.text', 'Volatile')
  })
})
