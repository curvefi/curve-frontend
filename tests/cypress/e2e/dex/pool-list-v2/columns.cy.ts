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
  PoolColumnId.CrvApy,
  PoolColumnId.Points,
  PoolColumnId.Age,
]

describe('V2 pool-list columns', () => {
  beforeEach(() => setupDexPoolListV2Mocks())

  it('shows the default columns and reveals optional columns in their defined order', () => {
    cy.clock(V2_POOL_FIXTURE_NOW, ['Date'])
    visitV2PoolList({ viewport: DESKTOP_VIEWPORT })

    expectHeaderOrder(DEFAULT_FULL_COLUMNS)
    for (const columnId of [PoolColumnId.Volume, PoolColumnId.Tvl]) {
      getV2PoolCell(V2_POOL_FIXTURES.highRewards.address, columnId)
        .find('[data-testid="pool-usd-value"]')
        .should('have.text', '-')
        .trigger('mouseover')
      cy.get('[role="tooltip"]').should('have.text', '$0')
      getV2PoolCell(V2_POOL_FIXTURES.highRewards.address, columnId)
        .find('[data-testid="pool-usd-value"]')
        .trigger('mouseout')
      cy.get('[role="tooltip"]').should('not.exist')
    }
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
      PoolColumnId.CrvApy,
      PoolColumnId.Points,
      PoolColumnId.Volume,
      PoolColumnId.Tvl,
      PoolColumnId.Age,
    ])
    getV2PoolCell(V2_POOL_FIXTURES.showcase.address, PoolColumnId.WeeklyBaseApy).should('contain.text', '22.09%')
    getV2PoolCell(V2_POOL_FIXTURES.partial.address, PoolColumnId.Age)
      .find('[data-testid="pool-age"]')
      .should('have.text', 'just now')
    getV2PoolCell(V2_POOL_FIXTURES.empty.address, PoolColumnId.Age)
      .find('[data-testid="pool-age"]')
      .should('have.text', '5 minutes')
    getV2PoolCell(V2_POOL_FIXTURES.showcase.address, PoolColumnId.Age)
      .find('[data-testid="pool-age"]')
      .should('have.text', '5 days')
      .trigger('mouseover')
    const expectedExactDate = new Intl.DateTimeFormat(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    }).format(new Date(V2_POOL_FIXTURES.showcase.creation_date! * 1000))
    cy.get('[role="tooltip"]').should('contain.text', expectedExactDate)
    getV2PoolCell(V2_POOL_FIXTURES.showcase.address, PoolColumnId.Age)
      .find('[data-testid="pool-age"]')
      .trigger('mouseout')
    cy.get('[role="tooltip"]').should('not.exist')
    getV2PoolCell(V2_POOL_FIXTURES.volatile.address, PoolColumnId.Age)
      .find('[data-testid="pool-age"]')
      .should('have.text', '1 week')
    getV2PoolCell(V2_POOL_FIXTURES.highRewards.address, PoolColumnId.Age)
      .find('[data-testid="pool-age"]')
      .should('have.text', '2 years')
    cy.get(`[data-testid="data-table-header-${PoolColumnId.Age}"]`).should('contain.text', 'Age')
    getV2PoolCell(V2_POOL_FIXTURES.killed.address, PoolColumnId.Age)
      .find('[data-testid="pool-age"]')
      .should('have.text', '-')
      .trigger('mouseover')
    cy.get('[role="tooltip"]').should('not.exist')
  })

  it('shows only the supported default columns on a Lite network', () => {
    visitV2PoolList({ network: 'taiko', viewport: DESKTOP_VIEWPORT })

    expectHeaderOrder([PoolColumnId.PoolName, PoolColumnId.Volume, PoolColumnId.Tvl])
  })

  it('classifies representative pool types and adds status badges', () => {
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

    getV2PoolRow(V2_POOL_FIXTURES.killed.address)
      .find('[data-testid="pool-badges"] [data-testid^="badge-pool-"]')
      .should($badges => {
        expect([...$badges].map(badge => badge.dataset.testid)).to.deep.equal([
          'badge-pool-type-stable',
          'badge-pool-inactive-gauge',
        ])
      })
    getV2PoolRow(V2_POOL_FIXTURES.killed.address)
      .find('[data-testid="badge-pool-inactive-gauge"]')
      .should('have.text', 'Inactive gauge')
  })

  it('appends icon-only pool and token alert badges with severity colors and tooltips', () => {
    visitV2PoolList({ viewport: DESKTOP_VIEWPORT })

    getV2PoolRow(V2_POOL_FIXTURES.alerts.address)
      .find('[data-testid="pool-badges"] [data-testid^="badge-"]')
      .should($badges => {
        expect([...$badges].map(badge => badge.dataset.testid)).to.deep.equal([
          'badge-pool-type-stable',
          'badge-pool-metapool',
          'badge-pool-inactive-gauge',
          'badge-pool-alert',
          'badge-token-alert',
        ])
      })

    getV2PoolRow(V2_POOL_FIXTURES.alerts.address)
      .find('[data-testid="badge-pool-alert"]')
      .should('have.class', 'MuiChip-colorAccent')
      .and('have.attr', 'aria-label', 'Pool alert')
      .and('have.attr', 'role', 'img')
      .and('have.attr', 'tabindex', '0')
      .and('have.text', '')
      .find('svg')
      .should('have.length', 1)
    getV2PoolRow(V2_POOL_FIXTURES.alerts.address).find('[data-testid="badge-pool-alert"]').trigger('mouseover')
    cy.get('[role="tooltip"]').should('contain.text', 'A dedicated market for absorbing distressed CRV long positions.')
    getV2PoolRow(V2_POOL_FIXTURES.alerts.address).find('[data-testid="badge-pool-alert"]').trigger('mouseout')
    cy.get('[role="tooltip"]').should('not.exist')

    getV2PoolRow(V2_POOL_FIXTURES.alerts.address)
      .find('[data-testid="badge-token-alert"]')
      .should('have.class', 'MuiChip-colorWarning')
      .and('have.attr', 'aria-label', 'Token alert')
      .and('have.attr', 'role', 'img')
      .and('have.attr', 'tabindex', '0')
      .and('have.text', '')
      .find('svg')
      .should('have.length', 1)
    getV2PoolRow(V2_POOL_FIXTURES.alerts.address).find('[data-testid="badge-token-alert"]').trigger('mouseover')
    cy.get('[role="tooltip"]').should(
      'contain.text',
      'The Ren network is currently operational but is expected to go offline in the near future.',
    )
  })
})
