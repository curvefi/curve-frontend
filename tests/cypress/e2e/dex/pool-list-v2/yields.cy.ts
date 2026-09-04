import { PoolColumnId } from '@/dex/features/pool-list/columns'
import { setupDexPoolListV2Mocks, V2_POOL_FIXTURES } from '@cy/support/helpers/dex-pool-list-v2-mocks'
import {
  DESKTOP_VIEWPORT,
  getV2PoolCell,
  showV2PoolColumns,
  visitV2PoolList,
} from '@cy/support/helpers/dex-pools-list-v2.helpers'

const POINTS_BADGE = '[data-testid="pool-points-badge"]'
const EXTRA_REWARD_BADGE = '[data-testid="pool-extra-reward-badge"]'
const CAMPAIGN_REWARD_BADGE = '[data-testid="pool-campaign-reward-badge"]'
const CRV_REWARD_BADGE = '[data-testid="pool-crv-reward-badge"]'

const YIELD_COLUMNS = [
  PoolColumnId.BaseRate,
  PoolColumnId.WeeklyBaseRate,
  PoolColumnId.RewardsRate,
  PoolColumnId.CrvRate,
  PoolColumnId.Points,
] as const

describe('V2 pool-list yields', () => {
  beforeEach(() => setupDexPoolListV2Mocks())

  it('combines every full-network yield source and campaign', () => {
    const { address } = V2_POOL_FIXTURES.showcase
    visitV2PoolList({ viewport: DESKTOP_VIEWPORT })
    showV2PoolColumns(YIELD_COLUMNS)

    getV2PoolCell(address, PoolColumnId.NetRate).find('[data-testid="pool-net-rate"]').should('have.text', '20%')
    getV2PoolCell(address, PoolColumnId.BaseRate).should('contain.text', '10%')
    getV2PoolCell(address, PoolColumnId.WeeklyBaseRate).should('contain.text', '20%')
    getV2PoolCell(address, PoolColumnId.RewardsRate).should('contain.text', '5%')
    getV2PoolCell(address, PoolColumnId.CrvRate).within(() => {
      cy.get('[data-testid="pool-crv-rate-unboosted"]').should('have.text', '5%')
      cy.get('[data-testid="pool-crv-rate-boosted"]').should('have.text', '12.50%')
    })

    getV2PoolCell(address, PoolColumnId.Points).within(() => {
      cy.get(POINTS_BADGE).should('have.length', 4)
      cy.contains(POINTS_BADGE, '30x').should('be.visible')
      cy.contains(POINTS_BADGE, '20x').should('be.visible')
    })
    getV2PoolCell(address, PoolColumnId.NetRate).within(() => {
      cy.get(POINTS_BADGE).should('have.length', 4)
      cy.get(EXTRA_REWARD_BADGE).should('have.length', 1)
      cy.get(CAMPAIGN_REWARD_BADGE).should('have.length', 1)
      cy.get(CRV_REWARD_BADGE).should('have.length', 1)
    })
    getV2PoolCell(address, PoolColumnId.RewardsRate).within(() => {
      cy.get(POINTS_BADGE).should('not.exist')
      cy.get(EXTRA_REWARD_BADGE).should('have.length', 1)
      cy.get(CAMPAIGN_REWARD_BADGE).should('have.length', 1)
      cy.get(CRV_REWARD_BADGE).should('not.exist')
    })
  })

  it('handles inactive, incomplete, empty, volatile, and high yield data', () => {
    visitV2PoolList({ viewport: DESKTOP_VIEWPORT })
    showV2PoolColumns(YIELD_COLUMNS)

    const killed = V2_POOL_FIXTURES.killed.address
    getV2PoolCell(killed, PoolColumnId.NetRate).should('contain.text', '6%')
    getV2PoolCell(killed, PoolColumnId.RewardsRate).should('contain.text', '5%')
    getV2PoolCell(killed, PoolColumnId.CrvRate).should('have.text', '-')
    getV2PoolCell(killed, PoolColumnId.NetRate).within(() => {
      cy.get(POINTS_BADGE).should('exist')
      cy.get(EXTRA_REWARD_BADGE).should('exist')
      cy.get(CAMPAIGN_REWARD_BADGE).should('exist')
      cy.get(CRV_REWARD_BADGE).should('not.exist')
    })

    const partial = V2_POOL_FIXTURES.partial.address
    getV2PoolCell(partial, PoolColumnId.NetRate).should('contain.text', '6%')
    getV2PoolCell(partial, PoolColumnId.CrvRate).should('have.text', '-')
    getV2PoolCell(partial, PoolColumnId.NetRate).find(CRV_REWARD_BADGE).should('not.exist')

    const empty = V2_POOL_FIXTURES.empty.address
    for (const column of [
      PoolColumnId.NetRate,
      PoolColumnId.BaseRate,
      PoolColumnId.WeeklyBaseRate,
      PoolColumnId.RewardsRate,
      PoolColumnId.CrvRate,
      PoolColumnId.Points,
    ]) {
      getV2PoolCell(empty, column).should('have.text', '-').and('not.contain.text', '0%')
    }

    const volatile = V2_POOL_FIXTURES.volatile.address
    getV2PoolCell(volatile, PoolColumnId.NetRate).should('contain.text', '5,000+%')
    getV2PoolCell(volatile, PoolColumnId.BaseRate).should('contain.text', '5,000+%')
    getV2PoolCell(volatile, PoolColumnId.WeeklyBaseRate)
      .invoke('text')
      .should('match', /^-\d+(\.\d+)?%$/)

    const highRewards = V2_POOL_FIXTURES.highRewards.address
    getV2PoolCell(highRewards, PoolColumnId.NetRate).should('contain.text', '5,000+%').and('not.contain.text', '6k%')
    getV2PoolCell(highRewards, PoolColumnId.BaseRate).should('contain.text', '1.00%')
    getV2PoolCell(highRewards, PoolColumnId.RewardsRate)
      .should('contain.text', '6k%')
      .and('not.contain.text', '5,000+%')
  })

  it('combines Lite-network API2 APRs with campaign APRs and points', () => {
    const { address } = V2_POOL_FIXTURES.lite
    visitV2PoolList({ network: 'taiko', viewport: DESKTOP_VIEWPORT })
    showV2PoolColumns([PoolColumnId.CrvRate, PoolColumnId.RewardsRate, PoolColumnId.Points])

    getV2PoolCell(address, PoolColumnId.NetRate).find('[data-testid="pool-net-rate"]').should('have.text', '13%')
    getV2PoolCell(address, PoolColumnId.RewardsRate).should('contain.text', '8%')
    getV2PoolCell(address, PoolColumnId.CrvRate).within(() => {
      cy.get('[data-testid="pool-crv-rate-unboosted"]').should('have.text', '5%')
      cy.get('[data-testid="pool-crv-rate-boosted"]').should('have.text', '12.50%')
    })
    getV2PoolCell(address, PoolColumnId.Points).find(POINTS_BADGE).should('have.text', 'TP')
  })
})
