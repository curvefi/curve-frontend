import { PoolBadges } from '@/dex/features/pool-list/cells/PoolTitleCell/PoolBadges'
import type { PoolType } from '@curvefi/prices-api/pools'
import { ComponentTestWrapper } from '@cy/support/helpers/ComponentTestWrapper'

const BADGE_ROW = '[data-testid="pool-badges"]'
const STABLE_BADGE = '[data-testid="badge-pool-type-stable"]'
const VOLATILE_BADGE = '[data-testid="badge-pool-type-volatile"]'
const METAPOOL_BADGE = '[data-testid="badge-pool-metapool"]'

const stablePoolTypes = ['main', 'factory', 'crvusd', 'stableswapng'] satisfies PoolType[]
const volatilePoolTypes = ['crypto', 'factory_crypto', 'factory_tricrypto', 'twocryptong'] satisfies PoolType[]

const mountPoolBadges = (poolType?: PoolType | null, isMetapool?: boolean | null) => {
  cy.mount(
    <ComponentTestWrapper>
      <PoolBadges pool={{ poolType, isMetapool }} />
    </ComponentTestWrapper>,
  )
}

const expectSinglePrimaryBadge = (selector: string, label: string) => {
  cy.get(BADGE_ROW).children().should('have.length', 1)
  cy.get(selector).should('have.text', label)
  cy.get(METAPOOL_BADGE).should('not.exist')
}

describe('PoolBadges', () => {
  for (const poolType of stablePoolTypes) {
    it(`maps ${poolType} pools to the Stable badge`, () => {
      mountPoolBadges(poolType, false)

      expectSinglePrimaryBadge(STABLE_BADGE, 'Stable')
      cy.get(VOLATILE_BADGE).should('not.exist')
    })
  }

  for (const poolType of volatilePoolTypes) {
    it(`maps ${poolType} pools to the Volatile badge`, () => {
      mountPoolBadges(poolType, false)

      expectSinglePrimaryBadge(VOLATILE_BADGE, 'Volatile')
      cy.get(STABLE_BADGE).should('not.exist')
    })
  }

  for (const poolType of ['main', 'crypto'] satisfies PoolType[]) {
    it(`renders the ${poolType} type badge before the additive Metapool badge`, () => {
      mountPoolBadges(poolType, true)

      cy.get(BADGE_ROW)
        .children()
        .should('have.length', 2)
        .then($badges => {
          const primaryBadge = poolType === 'main' ? 'badge-pool-type-stable' : 'badge-pool-type-volatile'

          expect($badges.eq(0)).to.have.attr('data-testid', primaryBadge)
          expect($badges.eq(1)).to.have.attr('data-testid', 'badge-pool-metapool')
        })
    })
  }

  for (const poolType of [null, undefined]) {
    it(`renders only Metapool when the pool type is ${String(poolType)}`, () => {
      mountPoolBadges(poolType, true)

      cy.get(BADGE_ROW).children().should('have.length', 1)
      cy.get(METAPOOL_BADGE).should('have.text', 'Metapool')
      cy.get(STABLE_BADGE).should('not.exist')
      cy.get(VOLATILE_BADGE).should('not.exist')
    })
  }

  for (const [poolType, isMetapool] of [
    [null, null],
    [undefined, undefined],
  ] as const) {
    it(`omits the badge row when type is ${String(poolType)} and Metapool is ${String(isMetapool)}`, () => {
      mountPoolBadges(poolType, isMetapool)

      cy.get(BADGE_ROW).should('not.exist')
    })
  }

  it('uses stable test IDs and the default extra-small Badge presentation', () => {
    mountPoolBadges('main', true)

    cy.get(STABLE_BADGE).should('have.class', 'MuiChip-sizeExtraSmall').and('have.class', 'MuiChip-colorDefault')
    cy.get(METAPOOL_BADGE).should('have.class', 'MuiChip-sizeExtraSmall').and('have.class', 'MuiChip-colorDefault')
    cy.get(VOLATILE_BADGE).should('not.exist')
  })
})
