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
  PoolColumnId.BaseApy,
  PoolColumnId.WeeklyBaseApy,
  PoolColumnId.RewardsApy,
  PoolColumnId.CrvApy,
  PoolColumnId.Points,
] as const

describe('V2 pool-list yields', () => {
  beforeEach(() => setupDexPoolListV2Mocks())

  it('combines every full-network yield source and campaign', () => {
    const { address } = V2_POOL_FIXTURES.showcase
    visitV2PoolList({ viewport: DESKTOP_VIEWPORT })
    showV2PoolColumns(YIELD_COLUMNS)

    getV2PoolCell(address, PoolColumnId.NetApy).find('[data-testid="pool-net-rate"]').should('have.text', '20.70%')
    getV2PoolCell(address, PoolColumnId.BaseApy).should('contain.text', '10.51%')
    getV2PoolCell(address, PoolColumnId.WeeklyBaseApy).should('contain.text', '22.09%')
    getV2PoolCell(address, PoolColumnId.RewardsApy).should('contain.text', '5.06%')
    getV2PoolCell(address, PoolColumnId.CrvApy).within(() => {
      cy.get('[data-testid="pool-crv-rate-unboosted"]').should('have.text', '5.12%')
      cy.get('[data-testid="pool-crv-rate-boosted"]').should('have.text', '13.30%')
    })

    getV2PoolCell(address, PoolColumnId.Points).within(() => {
      cy.get(POINTS_BADGE).should('have.length', 4)
      cy.contains(POINTS_BADGE, '30x').should('be.visible')
      cy.contains(POINTS_BADGE, '20x').should('be.visible')
    })
    getV2PoolCell(address, PoolColumnId.NetApy).within(() => {
      cy.get(POINTS_BADGE).should('have.length', 4)
      cy.get(EXTRA_REWARD_BADGE).should('have.length', 1)
      cy.get(CAMPAIGN_REWARD_BADGE).should('have.length', 1)
      cy.get(CRV_REWARD_BADGE).should('have.length', 1)
    })
    getV2PoolCell(address, PoolColumnId.RewardsApy).within(() => {
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
    getV2PoolCell(killed, PoolColumnId.NetApy).should('contain.text', '6.07%')
    getV2PoolCell(killed, PoolColumnId.RewardsApy).should('contain.text', '5.06%')
    getV2PoolCell(killed, PoolColumnId.CrvApy).should('have.text', '-')
    getV2PoolCell(killed, PoolColumnId.NetApy).within(() => {
      cy.get(POINTS_BADGE).should('exist')
      cy.get(EXTRA_REWARD_BADGE).should('exist')
      cy.get(CAMPAIGN_REWARD_BADGE).should('exist')
      cy.get(CRV_REWARD_BADGE).should('not.exist')
    })

    const partial = V2_POOL_FIXTURES.partial.address
    getV2PoolCell(partial, PoolColumnId.NetApy).should('contain.text', '6.13%')
    getV2PoolCell(partial, PoolColumnId.CrvApy).should('have.text', '-')
    getV2PoolCell(partial, PoolColumnId.NetApy).find(CRV_REWARD_BADGE).should('not.exist')

    const empty = V2_POOL_FIXTURES.empty.address
    for (const column of [
      PoolColumnId.NetApy,
      PoolColumnId.BaseApy,
      PoolColumnId.WeeklyBaseApy,
      PoolColumnId.RewardsApy,
      PoolColumnId.CrvApy,
      PoolColumnId.Points,
    ]) {
      getV2PoolCell(empty, column).should('have.text', '-').and('not.contain.text', '0%')
    }

    const volatile = V2_POOL_FIXTURES.volatile.address
    getV2PoolCell(volatile, PoolColumnId.NetApy).should('contain.text', '5,000+%')
    getV2PoolCell(volatile, PoolColumnId.BaseApy).should('contain.text', '5,000+%')
    getV2PoolCell(volatile, PoolColumnId.WeeklyBaseApy)
      .invoke('text')
      .should('match', /^-\d+\.\d+%$/)

    const highRewards = V2_POOL_FIXTURES.highRewards.address
    getV2PoolCell(highRewards, PoolColumnId.NetApy).should('contain.text', '5,000+%').and('not.contain.text', '11.75k%')
    getV2PoolCell(highRewards, PoolColumnId.BaseApy).should('contain.text', '1.005%')
    getV2PoolCell(highRewards, PoolColumnId.RewardsApy)
      .should('contain.text', '11.75k%')
      .and('not.contain.text', '5,000+%')
  })

  it('combines Lite-network API2 APRs with campaign APRs and points', () => {
    const { address } = V2_POOL_FIXTURES.lite
    visitV2PoolList({ network: 'taiko', viewport: DESKTOP_VIEWPORT })
    showV2PoolColumns([PoolColumnId.CrvApy, PoolColumnId.RewardsApy, PoolColumnId.Points])

    getV2PoolCell(address, PoolColumnId.NetApy).find('[data-testid="pool-net-rate"]').should('have.text', '13.32%')
    getV2PoolCell(address, PoolColumnId.RewardsApy).should('contain.text', '8.20%')
    getV2PoolCell(address, PoolColumnId.CrvApy).within(() => {
      cy.get('[data-testid="pool-crv-rate-unboosted"]').should('have.text', '5.12%')
      cy.get('[data-testid="pool-crv-rate-boosted"]').should('have.text', '13.30%')
    })
    getV2PoolCell(address, PoolColumnId.Points).find(POINTS_BADGE).should('have.text', 'TP')
  })
})
