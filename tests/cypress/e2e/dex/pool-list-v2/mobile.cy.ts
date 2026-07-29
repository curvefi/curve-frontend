import {
  setupDexPoolListV2Mocks,
  V2_POOL_FIXTURE_NOW,
  V2_POOL_FIXTURES,
} from '@cy/support/helpers/dex-pool-list-v2-mocks'
import { MOBILE_VIEWPORT, getV2PoolRow, visitV2PoolList } from '@cy/support/helpers/dex-pools-list-v2.helpers'

const EXPANDED_PANEL = '[data-testid="data-table-expansion-row"]'
const TOOLTIP = '[role="tooltip"]'

const FULL_NETWORK_METRIC_IDS = [
  'pool-net-apy',
  'pool-volume',
  'pool-tvl',
  'pool-base-apy',
  'pool-weekly-base-apy',
  'pool-rewards-apy',
  'pool-crv-apy',
  'pool-points-campaign-0',
  'pool-points-campaign-1',
  'pool-points-campaign-2',
  'pool-points-campaign-3',
  'pool-points-campaign-4',
  'pool-age',
] as const

const LITE_METRIC_IDS = [
  'pool-volume',
  'pool-tvl',
  'pool-rewards-apy',
  'pool-points-campaign-0',
  'pool-age',
] as const

const FULL_NETWORK_CAMPAIGNS = [
  {
    testId: 'pool-points-campaign-0',
    value: '30x',
    platform: 'TermMax',
    href: 'https://app.termmax.ts.finance',
  },
  {
    testId: 'pool-points-campaign-1',
    value: '20x',
    platform: 'Re',
    href: 'https://app.re.xyz/points',
  },
  {
    testId: 'pool-points-campaign-2',
    value: '-',
    platform: 'V2 points',
    href: 'https://app.merkl.xyz/opportunities/ethereum/POOL/v2-points-1',
  },
  {
    testId: 'pool-points-campaign-3',
    value: 'XP',
    platform: 'V2 xp',
    href: 'https://app.merkl.xyz/opportunities/ethereum/POOL/v2-points-2',
  },
  {
    testId: 'pool-points-campaign-4',
    value: 'STAR',
    platform: 'V2 stars',
    href: 'https://app.merkl.xyz/opportunities/ethereum/POOL/v2-points-3',
  },
] as const

const expectMetricOrder = (testIds: readonly string[]) => {
  cy.get(EXPANDED_PANEL)
    .find('[data-testid]')
    .should($elements => {
      const metricIds = [...$elements].flatMap(element => {
        const testId = element.getAttribute('data-testid')
        return testId && element.querySelector(`[data-testid="${testId}-value"]`) ? [testId] : []
      })

      expect(metricIds).to.deep.equal([...testIds])
    })
}

const expectPointsCampaign = ({
  testId,
  value,
  platform,
  href,
}: (typeof FULL_NETWORK_CAMPAIGNS)[number]) => {
  const selector = `[data-testid="${testId}"]`

  cy.get(EXPANDED_PANEL)
    .find(selector)
    .within(() => {
      cy.contains(/^Points$/).should('be.visible')
      cy.get(`[data-testid="${testId}-value"]`).should('have.text', value)
      cy.get(`img[alt="${platform}"]`).should('have.length', 1)
    })

  cy.get(EXPANDED_PANEL).find(selector).closest('a').as(`${testId}-link`)
  cy.get(`@${testId}-link`).should('have.attr', 'href', href)
  cy.get(`@${testId}-link`).should('have.attr', 'target', '_blank')
  cy.get(`@${testId}-link`).invoke('attr', 'aria-label').should('match', new RegExp(platform, 'i'))
}

describe('V2 pool-list mobile panels', () => {
  beforeEach(() => {
    setupDexPoolListV2Mocks()
    cy.clock(V2_POOL_FIXTURE_NOW, ['Date'])
  })

  it('shows the full-network metrics in the required order', () => {
    visitV2PoolList({ viewport: MOBILE_VIEWPORT })
    getV2PoolRow(V2_POOL_FIXTURES.showcase.address).find('[data-testid="expand-icon"]').click()

    cy.get(EXPANDED_PANEL).should('be.visible')
    expectMetricOrder(FULL_NETWORK_METRIC_IDS)

    cy.get(EXPANDED_PANEL).within(() => {
      cy.get('[data-testid="pool-net-apy"]').should('contain.text', 'Net APY')
      cy.get('[data-testid="pool-volume"]').should('contain.text', '24h Volume')
      cy.get('[data-testid="pool-tvl"]').should('contain.text', 'TVL')
      cy.get('[data-testid="pool-base-apy"]').should('contain.text', 'Base APY')
      cy.get('[data-testid="pool-weekly-base-apy"]').should('contain.text', '7D base APY')
      cy.get('[data-testid="pool-rewards-apy"]').should('contain.text', 'Rewards APY')
      cy.get('[data-testid="pool-crv-apy"]').should('contain.text', 'CRV APY')
      cy.get('[data-testid="pool-age"]').should('contain.text', 'Age')

      cy.get('[data-testid="pool-net-apy-value"]').should('contain.text', '20.70%')
      cy.get('[data-testid="pool-volume-value"]').should('contain.text', '$')
      cy.get('[data-testid="pool-tvl-value"]').should('contain.text', '$')
      cy.get('[data-testid="pool-base-apy-value"]').should('contain.text', '10.51%')
      cy.get('[data-testid="pool-weekly-base-apy-value"]').should('contain.text', '22.09%')
      cy.get('[data-testid="pool-rewards-apy-value"]').should('contain.text', '5.06%')
      cy.get('[data-testid="pool-crv-apy-value"]')
        .should('contain.text', '5.12%')
        .and('contain.text', '\u2192')
        .and('contain.text', '13.30%')
      cy.get('[data-testid="pool-age-value"]').should('not.have.text', '-')
    })

    for (const campaign of FULL_NETWORK_CAMPAIGNS) expectPointsCampaign(campaign)
  })

  it('shows detailed APY tooltips from the metric values', () => {
    visitV2PoolList({ viewport: MOBILE_VIEWPORT })
    getV2PoolRow(V2_POOL_FIXTURES.showcase.address).find('[data-testid="expand-icon"]').click()

    cy.get(EXPANDED_PANEL).find('[data-testid="pool-base-apy-value"]').as('baseApyValue').trigger('mouseover')
    cy.get(TOOLTIP)
      .should('contain.text', 'Base APY')
      .and('contain.text', 'trading activity over the past 24 hours')
      .and('contain.text', 'Daily')
      .and('contain.text', '10.51%')
      .and('contain.text', 'Weekly')
      .and('contain.text', '22.09%')
    cy.get('@baseApyValue').trigger('mouseout')
    cy.get(TOOLTIP).should('not.exist')

    cy.get(EXPANDED_PANEL)
      .find('[data-testid="pool-weekly-base-apy-value"]')
      .as('weeklyBaseApyValue')
      .trigger('mouseover')
    cy.get(TOOLTIP)
      .should('contain.text', 'Weekly Base APY')
      .and('contain.text', 'trading activity over the past 7 days')
      .and('contain.text', 'Daily')
      .and('contain.text', '10.51%')
      .and('contain.text', 'Weekly')
      .and('contain.text', '22.09%')
    cy.get('@weeklyBaseApyValue').trigger('mouseout')
    cy.get(TOOLTIP).should('not.exist')

    cy.get(EXPANDED_PANEL).find('[data-testid="pool-crv-apy-value"]').as('crvApyValue').trigger('mouseover')
    cy.get(TOOLTIP)
      .should('contain.text', 'CRV APY')
      .and('contain.text', 'CRV gauge reward APY ranges from the unboosted rate to the maximum boosted rate')
      .and('contain.text', 'The maximum rate assumes the full 2.5x gauge boost')
      .and('contain.text', 'Unboosted')
      .and('contain.text', '5.12%')
      .and('contain.text', 'Max boost')
      .and('contain.text', '13.30%')
    cy.get('@crvApyValue').trigger('mouseout')
    cy.get(TOOLTIP).should('not.exist')
  })

  it('shows only the supported metrics on a Lite network', () => {
    visitV2PoolList({ network: 'taiko', viewport: MOBILE_VIEWPORT })
    getV2PoolRow(V2_POOL_FIXTURES.lite.address).find('[data-testid="expand-icon"]').click()

    cy.get(EXPANDED_PANEL).should('be.visible')
    expectMetricOrder(LITE_METRIC_IDS)

    cy.get(EXPANDED_PANEL).within(() => {
      cy.get('[data-testid="pool-volume"]').should('contain.text', '24h Volume')
      cy.get('[data-testid="pool-tvl"]').should('contain.text', 'TVL')
      cy.get('[data-testid="pool-rewards-apy-value"]').should('contain.text', '%')
      cy.get('[data-testid="pool-points-campaign-0-value"]').should('have.text', 'TP')
      cy.get('[data-testid="pool-points-campaign-0"] img[alt="V2 taiko points"]').should('have.length', 1)
      cy.get('[data-testid="pool-age-value"]').should('not.have.text', '-')

      for (const testId of ['pool-net-apy', 'pool-base-apy', 'pool-weekly-base-apy', 'pool-crv-apy']) {
        cy.get(`[data-testid="${testId}"]`).should('not.exist')
      }
    })

    cy.get(EXPANDED_PANEL).find('[data-testid="pool-points-campaign-0"]').closest('a').as('litePointsLink')
    cy.get('@litePointsLink').should(
      'have.attr',
      'href',
      'https://app.merkl.xyz/opportunities/taiko/POOL/v2-lite-points-1',
    )
    cy.get('@litePointsLink').should('have.attr', 'target', '_blank')
    cy.get('@litePointsLink').invoke('attr', 'aria-label').should('match', /V2 taiko points/i)
  })

  it('shows missing APYs without inventing a points row', () => {
    visitV2PoolList({ viewport: MOBILE_VIEWPORT })
    getV2PoolRow(V2_POOL_FIXTURES.empty.address).find('[data-testid="expand-icon"]').click()

    cy.get(EXPANDED_PANEL).within(() => {
      for (const testId of [
        'pool-net-apy',
        'pool-base-apy',
        'pool-weekly-base-apy',
        'pool-rewards-apy',
        'pool-crv-apy',
      ]) {
        cy.get(`[data-testid="${testId}-value"]`).should('have.text', '-')
      }
      cy.get('[data-testid^="pool-points-campaign-"]').should('not.exist')
    })

    cy.get(EXPANDED_PANEL).find('[data-testid="pool-base-apy-value"]').as('zeroBaseApy').trigger('mouseover')
    cy.get(TOOLTIP).should('contain.text', 'Daily').and('contain.text', 'Weekly')
    cy.get('@zeroBaseApy').trigger('mouseout')
    cy.get(TOOLTIP).should('not.exist')
  })

  it('preserves volatile APY presentation and details', () => {
    visitV2PoolList({ viewport: MOBILE_VIEWPORT })
    getV2PoolRow(V2_POOL_FIXTURES.volatile.address).find('[data-testid="expand-icon"]').click()

    cy.get(EXPANDED_PANEL).within(() => {
      cy.get('[data-testid="pool-net-apy-value"]').should('contain.text', '5,000+%')
      cy.get('[data-testid="pool-base-apy-value"]').should('contain.text', '5,000+%')
      cy.get('[data-testid="pool-weekly-base-apy-value"]')
        .invoke('text')
        .should('match', /^-\d+\.\d+%$/)
    })

    cy.get(EXPANDED_PANEL).find('[data-testid="pool-net-apy-value"]').as('volatileNetApy').trigger('mouseover')
    cy.get(TOOLTIP).should('contain.text', 'This net APY is volatile and is unlikely to persist.')
    cy.get('@volatileNetApy').trigger('mouseout')
    cy.get(TOOLTIP).should('not.exist')
  })

  it('does not cap high rewards when the base APY is not volatile', () => {
    visitV2PoolList({ viewport: MOBILE_VIEWPORT })
    getV2PoolRow(V2_POOL_FIXTURES.highRewards.address).find('[data-testid="expand-icon"]').click()

    cy.get(EXPANDED_PANEL).within(() => {
      cy.get('[data-testid="pool-net-apy-value"]').should('not.contain.text', '5,000+%')
      cy.get('[data-testid="pool-base-apy-value"]').should('contain.text', '1.005%')
      cy.get('[data-testid="pool-rewards-apy-value"]').should('not.contain.text', '5,000+%')
    })
  })

  it('shows a fallback when pool age is unavailable', () => {
    visitV2PoolList({ viewport: MOBILE_VIEWPORT })
    getV2PoolRow(V2_POOL_FIXTURES.killed.address).find('[data-testid="expand-icon"]').click()

    cy.get(EXPANDED_PANEL).find('[data-testid="pool-age-value"]').should('have.text', '-')
  })
})
