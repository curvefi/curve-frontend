import { PoolColumnId } from '@/dex/features/pool-list/columns'
import {
  setupDexPoolListV2Mocks,
  V2_POOL_FIXTURE_NOW,
  V2_POOL_FIXTURES,
} from '@cy/support/helpers/dex-pool-list-v2-mocks'
import {
  DESKTOP_VIEWPORT,
  getV2PoolCell,
  getV2PoolRow,
  showV2PoolColumns,
  visitV2PoolList,
} from '@cy/support/helpers/dex-pools-list-v2.helpers'

const expectHeaderOrder = (expected: readonly PoolColumnId[]) =>
  cy.get('[data-testid="data-table-head"] [data-testid^="data-table-header-"]').should($headers => {
    const actual = [...$headers].map(header => header.dataset.testid?.replace('data-table-header-', ''))

    expect(actual).to.deep.equal(expected)
  })

const expectPoolBadgeSet = (address: string, expected: readonly string[]) =>
  getV2PoolRow(address)
    .find('[data-testid="pool-badges"] [data-testid^="badge-"]')
    .should($badges => {
      const actual = [...$badges].map(badge => badge.dataset.testid).toSorted()

      expect(actual).to.deep.equal(expected.toSorted())
    })

const DEFAULT_FULL_COLUMNS = [PoolColumnId.PoolName, PoolColumnId.NetApy, PoolColumnId.Volume, PoolColumnId.Tvl]
const OPTIONAL_FULL_COLUMNS = [
  PoolColumnId.BaseApy,
  PoolColumnId.WeeklyBaseApy,
  PoolColumnId.CrvApy,
  PoolColumnId.RewardsApy,
  PoolColumnId.Points,
  PoolColumnId.Age,
]

const DEFAULT_LITE_COLUMNS = [PoolColumnId.PoolName, PoolColumnId.Volume, PoolColumnId.Tvl]
const OPTIONAL_LITE_COLUMNS = [PoolColumnId.RewardsApy, PoolColumnId.Points, PoolColumnId.Age]
const FULL_ONLY_COLUMNS = [PoolColumnId.NetApy, PoolColumnId.BaseApy, PoolColumnId.WeeklyBaseApy, PoolColumnId.CrvApy]

describe('V2 pool-list columns', () => {
  beforeEach(() => {
    setupDexPoolListV2Mocks()
    cy.clock(V2_POOL_FIXTURE_NOW, ['Date'])
  })

  it('shows the default columns and reveals optional columns in their defined order', () => {
    visitV2PoolList({ viewport: DESKTOP_VIEWPORT })

    expectHeaderOrder(DEFAULT_FULL_COLUMNS)

    for (const { columnId, value } of [
      { columnId: PoolColumnId.Volume, value: '$6m' },
      { columnId: PoolColumnId.Tvl, value: '$10m' },
    ]) {
      getV2PoolCell(V2_POOL_FIXTURES.showcase.address, columnId)
        .find('[data-testid="pool-usd-value"]')
        .should('have.text', value)
    }

    for (const columnId of [PoolColumnId.Volume, PoolColumnId.Tvl]) {
      getV2PoolCell(V2_POOL_FIXTURES.highRewards.address, columnId)
        .find('[data-testid="pool-usd-value"]')
        .should('have.text', '-')
    }

    showV2PoolColumns(OPTIONAL_FULL_COLUMNS)

    expectHeaderOrder([
      PoolColumnId.PoolName,
      PoolColumnId.NetApy,
      PoolColumnId.BaseApy,
      PoolColumnId.WeeklyBaseApy,
      PoolColumnId.CrvApy,
      PoolColumnId.RewardsApy,
      PoolColumnId.Points,
      PoolColumnId.Volume,
      PoolColumnId.Tvl,
      PoolColumnId.Age,
    ])
    getV2PoolCell(V2_POOL_FIXTURES.showcase.address, PoolColumnId.WeeklyBaseApy).should('contain.text', '22.09%')
    getV2PoolCell(V2_POOL_FIXTURES.showcase.address, PoolColumnId.Age)
      .find('[data-testid="pool-age"]')
      .should('have.text', '5 days')
    getV2PoolCell(V2_POOL_FIXTURES.killed.address, PoolColumnId.Age)
      .find('[data-testid="pool-age"]')
      .should('have.text', '-')
  })

  it('shows only supported columns on a Lite network', () => {
    visitV2PoolList({ network: 'taiko', viewport: DESKTOP_VIEWPORT })

    expectHeaderOrder(DEFAULT_LITE_COLUMNS)

    cy.get('[data-testid="btn-visibility-settings"]').click()
    for (const columnId of OPTIONAL_LITE_COLUMNS) {
      cy.get(`[data-testid="visibility-toggle-${columnId}"]`).should('exist')
    }
    for (const columnId of FULL_ONLY_COLUMNS) {
      cy.get(`[data-testid="visibility-toggle-${columnId}"]`).should('not.exist')
    }
    cy.get('body').click(0, 0)

    showV2PoolColumns(OPTIONAL_LITE_COLUMNS)
    expectHeaderOrder([
      PoolColumnId.PoolName,
      PoolColumnId.RewardsApy,
      PoolColumnId.Points,
      PoolColumnId.Volume,
      PoolColumnId.Tvl,
      PoolColumnId.Age,
    ])
    getV2PoolCell(V2_POOL_FIXTURES.lite.address, PoolColumnId.Age)
      .find('[data-testid="pool-age"]')
      // The fixture is four minutes old, which the shared formatter groups into its under-five-minute state.
      .should('have.text', 'just now')
  })

  it('classifies representative pool types and adds status badges', () => {
    visitV2PoolList({ viewport: DESKTOP_VIEWPORT })

    expectPoolBadgeSet(V2_POOL_FIXTURES.showcase.address, ['badge-pool-type-stable', 'badge-pool-metapool'])

    expectPoolBadgeSet(V2_POOL_FIXTURES.volatile.address, ['badge-pool-type-volatile'])
    getV2PoolRow(V2_POOL_FIXTURES.volatile.address)
      .find('[data-testid="badge-pool-type-volatile"]')
      .should('have.text', 'Volatile')

    expectPoolBadgeSet(V2_POOL_FIXTURES.killed.address, ['badge-pool-type-stable', 'badge-pool-inactive-gauge'])
    getV2PoolRow(V2_POOL_FIXTURES.killed.address)
      .find('[data-testid="badge-pool-inactive-gauge"]')
      .should('have.text', 'Inactive gauge')
  })

  it('adds pool and token alert badges with severity colors', () => {
    visitV2PoolList({ viewport: DESKTOP_VIEWPORT })

    expectPoolBadgeSet(V2_POOL_FIXTURES.alerts.address, [
      'badge-pool-type-stable',
      'badge-pool-metapool',
      'badge-pool-inactive-gauge',
      'badge-pool-alert',
      'badge-token-alert',
    ])

    for (const { testId, severityClass } of [
      {
        testId: 'badge-pool-alert',
        severityClass: 'MuiChip-colorAccent',
      },
      {
        testId: 'badge-token-alert',
        severityClass: 'MuiChip-colorWarning',
      },
    ]) {
      const getAlertBadge = () => getV2PoolRow(V2_POOL_FIXTURES.alerts.address).find(`[data-testid="${testId}"]`)

      getAlertBadge().should('have.class', severityClass)
    }
  })
})
