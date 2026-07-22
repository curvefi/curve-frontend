import { BaseApyCell, WeeklyBaseApyCell } from '@/dex/features/pool-list/cells/BaseApyCell'
import { GaugeApyCell } from '@/dex/features/pool-list/cells/GaugeApyCell'
import { NetApyCell } from '@/dex/features/pool-list/cells/NetApyCell'
import { PointsCell } from '@/dex/features/pool-list/cells/PointsCell'
import { RewardsApyCell } from '@/dex/features/pool-list/cells/RewardsApyCell'
import { POOL_COLUMNS } from '@/dex/features/pool-list/columns/column.definitions'
import { POOLS_COLUMN_OPTIONS } from '@/dex/features/pool-list/columns/column.options'
import { PoolColumnId } from '@/dex/features/pool-list/columns/columns.enum'
import { PoolExpandedPanel } from '@/dex/features/pool-list/components/PoolExpandedPanel'
import type { PoolColumnVariant } from '@/dex/features/pool-list/hooks/usePoolsVisibility'
import type { PoolRow } from '@/dex/features/pool-list/types'
import { ComponentTestWrapper } from '@cy/support/helpers/ComponentTestWrapper'
import type { Address } from '@primitives/address.utils'
import { createColumnHelper, flexRender, getCoreRowModel, useReactTable } from '@tanstack/react-table'
import type { CampaignRewards } from '@ui-kit/entities/campaigns'
import { MAINNET_CRV_ADDRESS } from '@ui-kit/utils'

const POOL_ADDRESS = '0x1111111111111111111111111111111111111111' as Address
const GAUGE_ADDRESS = '0x2222222222222222222222222222222222222222' as Address
const REWARD_ADDRESS = '0x3333333333333333333333333333333333333333' as Address
const CAMPAIGN_ICON = '/images/default-crypto.png'
const NET_APY = '[data-testid="pool-net-apy-cell"]'
const REWARDS_APY = '[data-testid="pool-rewards-apy"]'
const NET_APY_TOOLTIP_TRIGGER = '[data-testid="pool-net-apy-tooltip-trigger"]'
const NET_APY_TOOLTIP_CONTENT = '[data-testid="pool-net-apy-tooltip-content"]'
const BASE_APY_TOOLTIP_TRIGGER = '[data-testid="pool-base-apy-tooltip-trigger"]'
const WEEKLY_BASE_APY_TOOLTIP_TRIGGER = '[data-testid="pool-weekly-base-apy-tooltip-trigger"]'
const REWARDS_APY_TOOLTIP_TRIGGER = '[data-testid="pool-rewards-apy-tooltip-trigger"]'
const GAUGE_APY_TOOLTIP_TRIGGER = '[data-testid="pool-gauge-apy-tooltip-trigger"]'
const GAUGE_APY = '[data-testid="pool-gauge-apy"]'
const GAUGE_APY_UNBOOSTED = '[data-testid="pool-gauge-apy-unboosted"]'
const GAUGE_APY_BOOSTED = '[data-testid="pool-gauge-apy-boosted"]'
const GAUGE_APY_CRV_ICON = `[data-testid="token-icon-${MAINNET_CRV_ADDRESS}"]`
const POINTS = '[data-testid="pool-points"]'
const POINTS_BADGE = '[data-testid="pool-points-badge"]'
const POINTS_ICON_CONTEXTS = [NET_APY, POINTS] as const
const REWARD_ICON_CONTEXTS = [NET_APY, REWARDS_APY] as const
const REWARD_BADGES = '[data-testid="pool-extra-reward-badge"], [data-testid="pool-campaign-reward-badge"]'
const NET_APY_BADGES = `${POINTS_BADGE}, ${REWARD_BADGES}, [data-testid="pool-crv-reward-badge"]`

const createCampaign = (overrides: Partial<CampaignRewards> = {}): CampaignRewards => ({
  campaignName: 'Bonus campaign',
  platform: 'Bonus Protocol',
  platformImageId: CAMPAIGN_ICON,
  dashboardLink: 'https://example.com/campaign',
  action: 'lp',
  tags: ['tokens'],
  address: POOL_ADDRESS,
  network: 'ethereum',
  description: 'Earn BONUS by providing liquidity.',
  steps: ['Deposit liquidity', 'Keep the position active'],
  lock: false,
  reward: { type: 'apr', value: 3 },
  symbol: 'BONUS',
  ...overrides,
})

const APR_CAMPAIGN = createCampaign()
const POINTS_CAMPAIGNS = [
  createCampaign({
    campaignName: 'Numeric points',
    tags: ['points'],
    reward: { type: 'points', value: 2 },
    symbol: undefined,
  }),
  createCampaign({
    campaignName: 'Symbolic APR-less campaign',
    tags: ['tokens'],
    reward: undefined,
    symbol: 'XP',
  }),
  createCampaign({
    campaignName: 'Generic points',
    tags: ['points'],
    reward: undefined,
    symbol: undefined,
  }),
]

const createPool = (overrides: Partial<PoolRow> = {}): PoolRow => ({
  chainId: 1,
  name: 'Rewards test pool',
  address: POOL_ADDRESS,
  poolType: 'main',
  isMetapool: false,
  basePool: null,
  tvlUsd: 1_000_000,
  tradingVolume24h: 100_000,
  tradingFee24h: 1_000,
  liquidityVolume24h: 90_000,
  liquidityFee24h: 900,
  coins: [
    {
      poolIndex: 0,
      symbol: 'BONUS',
      address: REWARD_ADDRESS,
      name: 'Bonus token',
      decimals: 18,
    },
  ],
  baseDailyApr: 10,
  baseWeeklyApr: 10,
  crvApr: 5,
  crvAprBoosted: 12.5,
  extraRewardsApr: [
    {
      address: REWARD_ADDRESS,
      symbol: 'BONUS',
      name: 'Bonus token',
      decimals: 18,
      price: 1,
      apr: 2,
    },
  ],
  vyperVersion: null,
  gauge: { address: GAUGE_ADDRESS, isKilled: false },
  gauges: [{ address: GAUGE_ADDRESS, isKilled: false }],
  campaigns: [APR_CAMPAIGN, ...POINTS_CAMPAIGNS],
  hasPosition: false,
  hasVyperVulnerability: false,
  network: 'ethereum',
  url: `/dex/ethereum/pools/${POOL_ADDRESS}/deposit`,
  ...overrides,
})

const columnHelper = createColumnHelper<PoolRow>()
const BASE_APY_COLUMNS = [
  columnHelper.accessor('baseDailyApr', { cell: BaseApyCell }),
  columnHelper.accessor('baseWeeklyApr', { cell: WeeklyBaseApyCell }),
]

const BaseApyHarness = ({ pool }: { pool: PoolRow }) => {
  const table = useReactTable({
    data: [pool],
    columns: BASE_APY_COLUMNS,
    getCoreRowModel: getCoreRowModel(),
  })
  const [row] = table.getRowModel().rows
  const [baseApyCell, weeklyBaseApyCell] = row?.getVisibleCells() ?? []

  return (
    <>
      <div data-testid="pool-base-apy">
        {baseApyCell ? flexRender(baseApyCell.column.columnDef.cell, baseApyCell.getContext()) : null}
      </div>
      <div data-testid="pool-weekly-base-apy">
        {weeklyBaseApyCell ? flexRender(weeklyBaseApyCell.column.columnDef.cell, weeklyBaseApyCell.getContext()) : null}
      </div>
    </>
  )
}

const RewardCells = ({ pool }: { pool: PoolRow }) => (
  <div>
    <NetApyCell pool={pool} />
    <BaseApyHarness pool={pool} />
    <RewardsApyCell pool={pool} />
    <GaugeApyCell pool={pool} />
    <PointsCell pool={pool} />
  </div>
)

const ExpandedPanelHarness = ({ pool, variant }: { pool: PoolRow; variant: PoolColumnVariant }) => {
  const table = useReactTable({
    data: [pool],
    columns: POOL_COLUMNS,
    getCoreRowModel: getCoreRowModel(),
  })
  const [row] = table.getRowModel().rows

  return row ? <PoolExpandedPanel row={row} table={table} variant={variant} /> : null
}

const mountRewardCells = (pool: PoolRow) => {
  cy.viewport(1200, 800)
  cy.mount(
    <ComponentTestWrapper>
      <RewardCells pool={pool} />
    </ComponentTestWrapper>,
  )
}

const getVisibilityOption = (variant: keyof typeof POOLS_COLUMN_OPTIONS, column: PoolColumnId) => {
  const option = POOLS_COLUMN_OPTIONS[variant]
    .flatMap(({ options }) => options)
    .find(({ columns }) => columns.includes(column))

  if (!option) throw new Error(`Missing ${column} visibility option for ${variant} pools`)

  return option
}

describe('v2 pool-list reward columns', () => {
  it('converts each APR independently and renders the split APY columns', () => {
    mountRewardCells(createPool({ baseWeeklyApr: 20 }))

    cy.get('[data-testid="pool-net-apy"]').should('have.text', '20.70%')
    cy.get('[data-testid="pool-base-apy"]').should('have.text', '10.51%').find('img').should('not.exist')
    cy.get('[data-testid="pool-weekly-base-apy"]').should('have.text', '22.09%').find('img').should('not.exist')
    cy.get('[data-testid="pool-rewards-apy"]').should('contain.text', '5.06%')
    cy.get(GAUGE_APY)
      .should('have.text', '5.12%13.30%')
      .within(() => {
        cy.get(`${GAUGE_APY_UNBOOSTED}, ${GAUGE_APY_BOOSTED}`)
          .should('have.length', 2)
          .eq(0)
          .should('have.attr', 'data-testid', 'pool-gauge-apy-unboosted')
        cy.get(`${GAUGE_APY_UNBOOSTED}, ${GAUGE_APY_BOOSTED}`)
          .eq(1)
          .should('have.attr', 'data-testid', 'pool-gauge-apy-boosted')
        cy.get(GAUGE_APY_UNBOOSTED).should('have.text', '5.12%')
        cy.get(GAUGE_APY_BOOSTED).should('have.text', '13.30%')
        cy.get(GAUGE_APY_CRV_ICON).should('have.length', 1)
      })

    cy.get(NET_APY).within(() => {
      cy.get(NET_APY_BADGES)
        .should('have.length', 6)
        .then($badges => {
          expect($badges.toArray().map(({ dataset }) => dataset.testid)).to.deep.equal([
            'pool-points-badge',
            'pool-points-badge',
            'pool-points-badge',
            'pool-extra-reward-badge',
            'pool-campaign-reward-badge',
            'pool-crv-reward-badge',
          ])
        })
      cy.get(POINTS_BADGE).should('have.text', '').find('img').should('have.length', 3)
    })
    cy.get(REWARDS_APY).within(() => {
      cy.get(POINTS_BADGE).should('not.exist')
      cy.get('[data-testid="pool-extra-reward-badge"]').should('have.length', 1)
      cy.get('[data-testid="pool-campaign-reward-badge"]').should('have.length', 1)
      cy.get('[data-testid="pool-crv-reward-badge"]').should('not.exist')
    })
  })

  it('shows detailed Net APY, Rewards APY, and Gauge APY breakdowns from their desktop values', () => {
    mountRewardCells(createPool())

    cy.get(NET_APY_TOOLTIP_TRIGGER).trigger('mouseover')
    cy.get('[role="tooltip"]')
      .should('be.visible')
      .and('contain.text', 'Base APY')
      .and('contain.text', '10.51%')
      .and('contain.text', 'Incentives')
      .and('contain.text', '10.19%')
      .and('contain.text', 'Total APY')
      .and('contain.text', '20.70%')
      .and('contain.text', 'Max veCRV Boost (2.5x)')
      .and('contain.text', '13.30%')
      .and('contain.text', 'Total max veCRV APY')
      .and('contain.text', '28.87%')
    cy.get(`${NET_APY_TOOLTIP_CONTENT} > .MuiStack-root > .MuiStack-root`)
      .children()
      .should('have.length', 5)
      .then($groups => {
        expect($groups.eq(0)).to.have.text('Base APY10.51%')
        expect($groups.eq(2)).to.have.text('Total APY20.70%')
        expect($groups.eq(3)).to.have.text('Max veCRV Boost (2.5x)13.30%')
        expect($groups.eq(4)).to.have.text('Total max veCRV APY28.87%')
      })
    cy.get(`${NET_APY_TOOLTIP_CONTENT} > .MuiStack-root > .MuiStack-root`)
      .children()
      .eq(1)
      .within(() => {
        cy.root()
          .children()
          .should('have.length', 7)
          .then($items => {
            expect($items.eq(0)).to.have.text('Incentives10.19%')
            expect($items.eq(1)).to.have.text('CRV5.12%')
            expect($items.eq(2)).to.have.text('BONUS2.02%')
            expect($items.eq(3)).to.have.text('BONUS3.04%')
            expect($items.eq(4)).to.have.text('Points2x')
            expect($items.eq(5)).to.have.text('Points-')
            expect($items.eq(6)).to.have.text('Points-')
          })
        cy.get('img').should('have.length', 6)
        cy.get('a[href="https://example.com/campaign"]')
          .should('have.length', 3)
          .each($link => {
            cy.wrap($link).should('have.attr', 'target', '_blank')
          })
      })
    cy.get(`${NET_APY_TOOLTIP_CONTENT} span`).then($spans => {
      expect($spans.filter((_, element) => element.textContent === 'Gauge APY')).to.have.length(0)
      expect($spans.filter((_, element) => element.textContent === 'Unboosted')).to.have.length(0)
      expect($spans.filter((_, element) => element.textContent === 'Rewards APY')).to.have.length(0)
    })
    cy.get(`${NET_APY_TOOLTIP_CONTENT} > .MuiStack-root`)
      .children()
      .last()
      .should(
        'have.text',
        'Points are shown for reference and are excluded from both totals. Maximum boost is included only in Total max veCRV APY.',
      )
    cy.get(NET_APY_TOOLTIP_TRIGGER).trigger('mouseout')
    cy.get('[role="tooltip"]').should('not.exist')

    cy.get(REWARDS_APY_TOOLTIP_TRIGGER).trigger('mouseover')
    cy.get('[role="tooltip"]')
      .should('be.visible')
      .and('contain.text', 'Incentives')
      .and('contain.text', '2.02%')
      .and('contain.text', 'Campaign rewards')
      .and('contain.text', '3.04%')
      .and('contain.text', 'BONUS')
      .and('contain.text', 'Rewards APY')
      .and('contain.text', '5.06%')
      .and('contain.text', 'Points are not included.')
      .find('img')
      .should('have.length', 2)
    cy.get('[data-testid="pool-rewards-apy-tooltip-content"] span').then($spans => {
      expect($spans.filter((_, element) => element.textContent === 'Direct incentives APY')).to.have.length(0)
      expect($spans.filter((_, element) => element.textContent === 'Campaign rewards APY')).to.have.length(0)
      expect($spans.filter((_, element) => element.textContent === 'Rewards APY')).to.have.length(1)
    })
    cy.get(REWARDS_APY_TOOLTIP_TRIGGER).trigger('mouseout')
    cy.get('[role="tooltip"]').should('not.exist')

    cy.get(GAUGE_APY_TOOLTIP_TRIGGER).trigger('mouseover')
    cy.get('[role="tooltip"]')
      .should('be.visible')
      .and('contain.text', 'Gauge APY')
      .and('contain.text', 'Unboosted')
      .and('contain.text', '5.12%')
      .and('contain.text', 'Maximum')
      .and('contain.text', '13.30%')
      .and('contain.text', 'Gauge APY')
      .and('contain.text', 'The maximum rate assumes the full 2.5x gauge boost.')
      .find('img')
      .should('have.length', 2)
  })

  it('shows daily and weekly Base APY rows without an aggregate row', () => {
    mountRewardCells(createPool({ baseWeeklyApr: 20 }))

    const tooltipTargets = [
      {
        trigger: BASE_APY_TOOLTIP_TRIGGER,
        title: 'Base APY',
        description:
          'Annualized yield generated by the pool based on trading activity over the past 24 hours. If the pool contains yield-bearing assets, their intrinsic yield is included.',
      },
      {
        trigger: WEEKLY_BASE_APY_TOOLTIP_TRIGGER,
        title: 'Weekly Base APY',
        description:
          'Annualized yield generated by the pool based on trading activity over the past 7 days. If the pool contains yield-bearing assets, their intrinsic yield is included.',
      },
    ]

    tooltipTargets.forEach(({ trigger, title, description }) => {
      cy.get(trigger).trigger('mouseover')
      cy.get('[role="tooltip"]').should('be.visible').find('.MuiTypography-bodyMBold').should('have.text', title)

      cy.get('[data-testid="pool-base-apy-tooltip-content"]')
        .should('contain.text', description)
        .and('contain.text', 'Daily')
        .and('contain.text', '10.51%')
        .and('contain.text', 'Weekly')
        .and('contain.text', '22.09%')
      cy.get('[data-testid="pool-base-apy-tooltip-content"] > .MuiStack-root > .MuiStack-root')
        .children()
        .should('have.length', 2)
        .first()
        .should('contain.text', 'Daily')
        .and('contain.text', '10.51%')
      cy.get('[data-testid="pool-base-apy-tooltip-content"] > .MuiStack-root > .MuiStack-root')
        .children()
        .eq(1)
        .should('contain.text', 'Weekly')
        .and('contain.text', '22.09%')
      cy.get(trigger).trigger('mouseout')
      cy.get('[role="tooltip"]').should('not.exist')
    })
  })

  it('shows the individual APY and source details in reward tooltips', () => {
    mountRewardCells(createPool())

    POINTS_ICON_CONTEXTS.forEach(context => {
      cy.get(`${context} ${POINTS_BADGE}`).first().trigger('mouseover')
      cy.get('[role="tooltip"]')
        .should('be.visible')
        .and('contain.text', 'Numeric points')
        .and('contain.text', 'Earn BONUS by providing liquidity.')
        .and('contain.text', 'Deposit liquidity')
        .and('contain.text', 'Go to issuer')
      cy.get(`${context} ${POINTS_BADGE}`).first().trigger('mouseout')
      cy.get('[role="tooltip"]').should('not.exist')
    })

    REWARD_ICON_CONTEXTS.forEach(context => {
      cy.get(`${context} [data-testid="pool-extra-reward-badge"]`).trigger('mouseover')
      cy.get('[role="tooltip"]')
        .should('be.visible')
        .and('contain.text', 'Extra pool reward')
        .and('contain.text', 'BONUS')
        .and('contain.text', 'APY: 2.02%')
      cy.get(`${context} [data-testid="pool-extra-reward-badge"]`).trigger('mouseout')
      cy.get('[role="tooltip"]').should('not.exist')

      cy.get(`${context} [data-testid="pool-campaign-reward-badge"]`).trigger('mouseover')
      cy.get('[role="tooltip"]')
        .should('be.visible')
        .and('contain.text', 'APY: 3.04%')
        .and('contain.text', 'Bonus campaign')
        .and('contain.text', 'Earn BONUS by providing liquidity.')
        .and('contain.text', 'Steps:')
        .and('contain.text', 'Deposit liquidity')
        .and('contain.text', 'Go to issuer')
      cy.get(`${context} [data-testid="pool-campaign-reward-badge"]`).trigger('mouseout')
      cy.get('[role="tooltip"]').should('not.exist')
    })

    cy.get(`${NET_APY} [data-testid="pool-crv-reward-badge"]`).trigger('mouseover')
    cy.get('[role="tooltip"]')
      .should('be.visible')
      .and('contain.text', 'CRV gauge reward')
      .and('contain.text', 'APY: 5.12%')
      .and('contain.text', '13.30%')
      .and('contain.text', 'max boost of 2.50')
  })

  it('preserves duplicate reward icons and keeps CRV last in Net APY', () => {
    const [reward] = createPool().extraRewardsApr
    if (!reward) throw new Error('Expected the reward fixture')

    mountRewardCells(
      createPool({
        extraRewardsApr: [reward, reward],
        campaigns: [APR_CAMPAIGN, APR_CAMPAIGN, ...POINTS_CAMPAIGNS],
      }),
    )

    cy.get(NET_APY).within(() => {
      cy.get(POINTS_BADGE).should('have.length', 3)
      cy.get('[data-testid="pool-extra-reward-badge"]').should('have.length', 2)
      cy.get('[data-testid="pool-campaign-reward-badge"]').should('have.length', 2)
      cy.get(NET_APY_BADGES).should('have.length', 8).last().should('have.attr', 'data-testid', 'pool-crv-reward-badge')
    })
    cy.get(REWARDS_APY).within(() => {
      cy.get(POINTS_BADGE).should('not.exist')
      cy.get('[data-testid="pool-extra-reward-badge"]').should('have.length', 2)
      cy.get('[data-testid="pool-campaign-reward-badge"]').should('have.length', 2)
      cy.get('[data-testid="pool-crv-reward-badge"]').should('not.exist')
    })

    cy.get(REWARDS_APY_TOOLTIP_TRIGGER).trigger('mouseover')
    cy.get('[role="tooltip"]').within(() => {
      cy.contains('Incentives').should('exist')
      cy.contains('Campaign rewards').should('exist')
      cy.get('span').then($spans => {
        expect($spans.filter((_, element) => element.textContent === 'BONUS')).to.have.length(4)
      })
      cy.get('img').should('have.length', 4)
    })
  })

  it('keeps numeric, APR-less symbolic, and value-less campaigns independent from Net APY', () => {
    mountRewardCells(
      createPool({
        campaigns: [
          APR_CAMPAIGN,
          ...POINTS_CAMPAIGNS,
          createCampaign({
            campaignName: 'Fourth points campaign',
            tags: ['points'],
            reward: undefined,
            symbol: 'FOUR',
          }),
          createCampaign({
            campaignName: 'Ignored points campaign',
            tags: ['points'],
            reward: undefined,
            symbol: 'FIVE',
          }),
        ],
      }),
    )

    cy.get(POINTS)
      .should('have.css', 'grid-auto-flow', 'column')
      .within(() => {
        cy.get(POINTS_BADGE).should('have.length', 4)
        cy.get(POINTS_BADGE).eq(0).should('contain.text', '2x').find('img').should('have.length', 1)
        cy.get(POINTS_BADGE).eq(1).should('contain.text', 'XP')
        cy.get(POINTS_BADGE).eq(2).should('contain.text', 'Points')
        cy.get(POINTS_BADGE).eq(3).should('contain.text', 'FOUR')
        cy.root().should('not.contain.text', 'FIVE')
      })
    cy.get(NET_APY).within(() => {
      cy.get(POINTS_BADGE).should('have.length', 4).and('have.text', '').find('img').should('have.length', 4)
      cy.get(NET_APY_BADGES).should('have.length', 7)
      cy.get(NET_APY_BADGES).eq(4).should('have.attr', 'data-testid', 'pool-extra-reward-badge')
      cy.get(NET_APY_BADGES).eq(5).should('have.attr', 'data-testid', 'pool-campaign-reward-badge')
      cy.get(NET_APY_BADGES).eq(6).should('have.attr', 'data-testid', 'pool-crv-reward-badge')
    })
    cy.get(REWARDS_APY)
      .should('contain.text', '5.06%')
      .and('not.contain.text', '2x')
      .find(POINTS_BADGE)
      .should('not.exist')
    cy.get('[data-testid="pool-net-apy"]').should('have.text', '20.70%')

    cy.get(NET_APY_TOOLTIP_TRIGGER).trigger('mouseover')
    cy.get(`${NET_APY_TOOLTIP_CONTENT} > .MuiStack-root > .MuiStack-root`)
      .children()
      .then($groups => {
        expect($groups.eq(1)).to.contain.text('Incentives10.19%')
        expect($groups.eq(2)).to.have.text('Total APY20.70%')
        expect($groups.eq(4)).to.have.text('Total max veCRV APY28.87%')
      })
    cy.get(`${NET_APY_TOOLTIP_CONTENT} > .MuiStack-root > .MuiStack-root`)
      .children()
      .eq(1)
      .within(() => {
        cy.root()
          .children()
          .then($items => {
            const pointItems = $items.slice(4)

            expect(pointItems).to.have.length(5)
            pointItems.each((index, item) => {
              const $item = Cypress.$(item)

              expect($item.find('img')).to.have.length(1)
              expect($item).to.have.text(index === 0 ? 'Points2x' : 'Points-')
            })
          })
        cy.get('a[href="https://example.com/campaign"]')
          .should('have.length', 5)
          .each($link => {
            cy.wrap($link).should('have.attr', 'target', '_blank')
          })
      })
  })

  it('excludes a killed gauge from Net APY without hiding rewards or points', () => {
    mountRewardCells(
      createPool({
        gauge: { address: GAUGE_ADDRESS, isKilled: true },
        gauges: [{ address: GAUGE_ADDRESS, isKilled: true }],
      }),
    )

    cy.get('[data-testid="pool-net-apy"]').should('have.text', '15.57%')
    cy.get(GAUGE_APY)
      .should('have.text', 'Inactive gauge')
      .within(() => {
        cy.get(GAUGE_APY_BOOSTED).should('not.exist')
        cy.get(GAUGE_APY_CRV_ICON).should('not.exist')
      })
    cy.get('[data-testid="pool-rewards-apy"]').should('contain.text', '5.06%')
    cy.get(POINTS).find(POINTS_BADGE).should('have.length', 3)
    cy.get(NET_APY).within(() => {
      cy.get(POINTS_BADGE).should('have.length', 3)
      cy.get('[data-testid="pool-crv-reward-badge"]').should('not.exist')
      cy.get(REWARD_BADGES).should('have.length', 2)
    })

    cy.get(GAUGE_APY).trigger('mouseover')
    cy.get('[role="tooltip"]').should('not.exist')

    cy.get(NET_APY_TOOLTIP_TRIGGER).trigger('mouseover')
    cy.get('[role="tooltip"]')
      .should('be.visible')
      .and('contain.text', 'Incentives')
      .and('contain.text', '5.06%')
      .and('contain.text', 'Total APY')
      .and('contain.text', '15.57%')
      .and('not.contain.text', 'Gauge APY')
      .and('not.contain.text', 'Inactive gauge')
      .and('not.contain.text', 'Unboosted')
      .and(
        'contain.text',
        'Points are shown for reference and are excluded from both totals. Maximum boost is included only in Total max veCRV APY.',
      )
    cy.get(`${NET_APY_TOOLTIP_CONTENT} > .MuiStack-root > .MuiStack-root`)
      .children()
      .should('have.length', 3)
      .then($groups => {
        expect($groups.eq(0)).to.have.text('Base APY10.51%')
        expect($groups.eq(1)).to.contain.text('Incentives5.06%')
        expect($groups.eq(2)).to.have.text('Total APY15.57%')
      })
    cy.get(`${NET_APY_TOOLTIP_CONTENT} > .MuiStack-root > .MuiStack-root span`).then($spans => {
      expect($spans.filter((_, element) => element.textContent === 'CRV')).to.have.length(0)
      expect($spans.filter((_, element) => element.textContent === 'Max veCRV Boost (2.5x)')).to.have.length(0)
      expect($spans.filter((_, element) => element.textContent === 'Total max veCRV APY')).to.have.length(0)
    })
    cy.get(`${NET_APY_TOOLTIP_CONTENT} > .MuiStack-root`)
      .children()
      .last()
      .should(
        'have.text',
        'Points are shown for reference and are excluded from both totals. Maximum boost is included only in Total max veCRV APY.',
      )
  })

  it('omits the maximum scenario when gauge metadata is unavailable', () => {
    mountRewardCells(createPool({ gauge: undefined, gauges: [] }))

    cy.get('[data-testid="pool-net-apy"]').should('have.text', '20.70%')
    cy.get(NET_APY_TOOLTIP_TRIGGER).trigger('mouseover')
    cy.get(`${NET_APY_TOOLTIP_CONTENT} > .MuiStack-root > .MuiStack-root`)
      .children()
      .should('have.length', 3)
      .then($groups => {
        expect($groups.eq(1)).to.contain.text('Incentives10.19%')
        expect($groups.eq(2)).to.have.text('Total APY20.70%')
      })
    cy.get(`${NET_APY_TOOLTIP_CONTENT} > .MuiStack-root > .MuiStack-root span`).then($spans => {
      expect($spans.filter((_, element) => element.textContent === 'CRV')).to.have.length(1)
      expect($spans.filter((_, element) => element.textContent === 'Max veCRV Boost (2.5x)')).to.have.length(0)
      expect($spans.filter((_, element) => element.textContent === 'Total max veCRV APY')).to.have.length(0)
    })
  })

  it('uses formatter fallbacks for missing APY values', () => {
    mountRewardCells(
      createPool({
        baseDailyApr: null,
        baseWeeklyApr: null,
        crvApr: null,
        crvAprBoosted: null,
        extraRewardsApr: [],
        gauge: undefined,
        gauges: [],
        campaigns: POINTS_CAMPAIGNS,
      }),
    )

    cy.get('[data-testid="pool-net-apy"]').should('have.text', '-')
    cy.get('[data-testid="pool-base-apy"]').should('have.text', '-')
    cy.get('[data-testid="pool-weekly-base-apy"]').should('have.text', '-')
    cy.get('[data-testid="pool-rewards-apy"]').should('have.text', '-')
    cy.get(GAUGE_APY)
      .should('have.text', '-')
      .within(() => {
        cy.get(GAUGE_APY_BOOSTED).should('not.exist')
        cy.get(GAUGE_APY_CRV_ICON).should('not.exist')
      })
    cy.get(POINTS).find(POINTS_BADGE).should('have.length', 3)
    cy.get(NET_APY).within(() => {
      cy.get(POINTS_BADGE).should('have.length', 3).and('have.text', '')
      cy.get(REWARD_BADGES).should('not.exist')
    })
    cy.get('[data-testid="pool-net-apy-cell"] [data-testid$="-reward-badge"]').should('not.exist')
    cy.get(NET_APY_TOOLTIP_TRIGGER).should('not.exist')
    cy.get(BASE_APY_TOOLTIP_TRIGGER).should('not.exist')
    cy.get(WEEKLY_BASE_APY_TOOLTIP_TRIGGER).should('not.exist')
    cy.get(REWARDS_APY_TOOLTIP_TRIGGER).should('not.exist')
    cy.get(GAUGE_APY_TOOLTIP_TRIGGER).should('not.exist')

    cy.get(GAUGE_APY).trigger('mouseover')
    cy.get('[role="tooltip"]').should('not.exist')
  })

  it('uses formatter fallbacks instead of rendering zero APY values', () => {
    mountRewardCells(
      createPool({
        baseDailyApr: 0,
        baseWeeklyApr: 0,
        crvApr: 0,
        crvAprBoosted: 0,
        extraRewardsApr: [],
        campaigns: [createCampaign({ reward: { type: 'apr', value: 0 } })],
      }),
    )

    cy.get('[data-testid="pool-net-apy"]').should('have.text', '-')
    cy.get('[data-testid="pool-base-apy"]').should('have.text', '-')
    cy.get('[data-testid="pool-weekly-base-apy"]').should('have.text', '-')
    cy.get('[data-testid="pool-rewards-apy"]').should('contain.text', '-')
    cy.get('[data-testid="pool-net-apy-cell"] [data-testid="pool-campaign-reward-badge"]').should('have.length', 1)
    cy.get('[data-testid="pool-rewards-apy"] [data-testid="pool-campaign-reward-badge"]').should('have.length', 1)
    cy.get('[data-testid="pool-crv-reward-badge"]').should('not.exist')
    cy.get(GAUGE_APY)
      .should('have.text', '-')
      .within(() => {
        cy.get(GAUGE_APY_BOOSTED).should('not.exist')
        cy.get(GAUGE_APY_CRV_ICON).should('not.exist')
      })
    cy.get('[data-testid="pool-points"]').should('have.text', '-')
    cy.get(NET_APY_TOOLTIP_TRIGGER).should('not.exist')
    cy.get(BASE_APY_TOOLTIP_TRIGGER).should('exist')
    cy.get(WEEKLY_BASE_APY_TOOLTIP_TRIGGER).should('exist')
    cy.get(REWARDS_APY_TOOLTIP_TRIGGER).should('not.exist')
    cy.get(GAUGE_APY_TOOLTIP_TRIGGER).should('not.exist')

    cy.get(GAUGE_APY).trigger('mouseover')
    cy.get('[role="tooltip"]').should('not.exist')
  })

  it('preserves negative Weekly Base APY values and their shared warning', () => {
    mountRewardCells(
      createPool({
        baseDailyApr: 10,
        baseWeeklyApr: -10,
        crvApr: null,
        crvAprBoosted: null,
        extraRewardsApr: [],
        campaigns: [],
      }),
    )

    cy.get('[data-testid="pool-net-apy"]').should('have.text', '10.51%')
    cy.get('[data-testid="pool-base-apy"]').should('have.text', '10.51%')
    cy.get('[data-testid="pool-weekly-base-apy"]')
      .invoke('text')
      .should('match', /^-\d+\.\d+%$/)
    const tooltipTriggers = [BASE_APY_TOOLTIP_TRIGGER, WEEKLY_BASE_APY_TOOLTIP_TRIGGER]

    tooltipTriggers.forEach(trigger => {
      cy.get(trigger).trigger('mouseover')
      cy.get('[role="tooltip"]').should('contain.text', 'Base APY can temporarily be negative')
      cy.get(trigger).trigger('mouseout')
      cy.get('[role="tooltip"]').should('not.exist')
    })
  })

  it('shows the rich volatile Net APY warning while retaining the Base and mobile chip tooltips', () => {
    const pool = createPool({ baseDailyApr: 5_000 })

    mountRewardCells(pool)

    cy.get('[data-testid="pool-net-apy"]').should('contain.text', '5,000+%')
    cy.get('[data-testid="pool-base-apy"]').should('contain.text', '5,000+%')
    cy.get('[data-testid="pool-weekly-base-apy"]').should('have.text', '10.51%')
    cy.get('[data-testid="pool-net-apy-cell"] [data-testid$="-reward-badge"]').should('have.length', 3)
    cy.get(BASE_APY_TOOLTIP_TRIGGER).should('not.exist')
    cy.get(WEEKLY_BASE_APY_TOOLTIP_TRIGGER).should('exist')

    cy.get(NET_APY_TOOLTIP_TRIGGER).trigger('mouseover')
    cy.get('[role="tooltip"]')
      .should('be.visible')
      .and('contain.text', 'Base APY')
      .and('contain.text', 'Net APY')
      .and('contain.text', 'This net APY is volatile and is unlikely to persist.')
    cy.get(NET_APY_TOOLTIP_TRIGGER).trigger('mouseout')
    cy.get('[role="tooltip"]').should('not.exist')

    cy.get('[data-testid="pool-base-apy-value"] .tooltip-button').trigger('mouseover')
    cy.get('[role="tooltip"]')
      .should('be.visible')
      .and('contain.text', 'This is a volatile number that will very likely not persist.')
      .and('not.contain.text', 'Net APY')
    cy.get('[data-testid="pool-base-apy-value"] .tooltip-button').trigger('mouseout')
    cy.get('[role="tooltip"]').should('not.exist')

    cy.viewport(375, 800)
    cy.mount(
      <ComponentTestWrapper>
        <ExpandedPanelHarness pool={pool} variant="full" />
      </ComponentTestWrapper>,
    )

    cy.get(NET_APY_TOOLTIP_TRIGGER).should('not.exist')
    cy.get('[data-testid="pool-net-apy"] .tooltip-button').click()
    cy.get('[role="tooltip"]')
      .should('be.visible')
      .and('contain.text', 'This is a volatile number that will very likely not persist.')
      .and('not.contain.text', 'This net APY is volatile and is unlikely to persist.')
  })

  it('does not label a large Net APY as volatile when Base APY is below the threshold', () => {
    mountRewardCells(
      createPool({
        baseDailyApr: 400,
        baseWeeklyApr: 5_000,
        crvApr: null,
        crvAprBoosted: null,
        extraRewardsApr: [{ ...createPool().extraRewardsApr[0], apr: 200 }],
        campaigns: [],
      }),
    )

    cy.get('[data-testid="pool-net-apy"]').should('not.contain.text', '5,000+%')
    cy.get('[data-testid="pool-base-apy"]').should('not.contain.text', '5,000+%')
    cy.get('[data-testid="pool-weekly-base-apy"]').should('contain.text', '5,000+%')
    cy.get(WEEKLY_BASE_APY_TOOLTIP_TRIGGER).should('not.exist')
  })

  it('only displays Gauge APY when both endpoints are non-zero', () => {
    const partialRanges = [
      { range: { crvApr: 0, crvAprBoosted: 12.5 }, includesCrvInNetApy: false },
      { range: { crvApr: null, crvAprBoosted: 12.5 }, includesCrvInNetApy: false },
      { range: { crvApr: 5, crvAprBoosted: null }, includesCrvInNetApy: true },
    ]

    partialRanges.forEach(({ range, includesCrvInNetApy }) => {
      mountRewardCells(createPool(range))

      cy.get(GAUGE_APY)
        .should('have.text', '-')
        .within(() => {
          cy.get(GAUGE_APY_BOOSTED).should('not.exist')
          cy.get(GAUGE_APY_CRV_ICON).should('not.exist')
        })
      cy.get('[data-testid="pool-net-apy-cell"] [data-testid="pool-crv-reward-badge"]').should('not.exist')
      cy.get(GAUGE_APY).trigger('mouseover')
      cy.get('[role="tooltip"]').should('not.exist')

      cy.get(NET_APY_TOOLTIP_TRIGGER).trigger('mouseover')
      cy.get('[role="tooltip"]').should('be.visible')
      cy.get(`${NET_APY_TOOLTIP_CONTENT} > .MuiStack-root > .MuiStack-root`)
        .children()
        .should('have.length', 3)
        .then($groups => {
          expect($groups.eq(1)).to.contain.text(`Incentives${includesCrvInNetApy ? '10.19%' : '5.06%'}`)
          expect($groups.eq(2)).to.have.text(`Total APY${includesCrvInNetApy ? '20.70%' : '15.57%'}`)
        })
      cy.get(`${NET_APY_TOOLTIP_CONTENT} > .MuiStack-root > .MuiStack-root`)
        .children()
        .eq(1)
        .find('span')
        .then($spans => {
          expect($spans.filter((_, element) => element.textContent === 'CRV')).to.have.length(
            includesCrvInNetApy ? 1 : 0,
          )
        })
      cy.get(`${NET_APY_TOOLTIP_CONTENT} > .MuiStack-root > .MuiStack-root span`).then($spans => {
        expect($spans.filter((_, element) => element.textContent === 'Gauge APY')).to.have.length(0)
        expect($spans.filter((_, element) => element.textContent === 'Unboosted')).to.have.length(0)
        expect($spans.filter((_, element) => element.textContent === 'Max veCRV Boost (2.5x)')).to.have.length(0)
        expect($spans.filter((_, element) => element.textContent === 'Total max veCRV APY')).to.have.length(0)
      })
      cy.get(`${NET_APY_TOOLTIP_CONTENT} > .MuiStack-root`)
        .children()
        .last()
        .should(
          'have.text',
          'Points are shown for reference and are excluded from both totals. Maximum boost is included only in Total max veCRV APY.',
        )
      cy.get(NET_APY_TOOLTIP_TRIGGER).trigger('mouseout')
      cy.get('[role="tooltip"]').should('not.exist')
    })
  })

  it('uses the full and lite reward support in the mobile expanded panel', () => {
    const pool = createPool({ baseWeeklyApr: 20 })

    cy.viewport(375, 800)
    cy.mount(
      <ComponentTestWrapper>
        <div>
          <div data-testid="full-expanded-panel">
            <ExpandedPanelHarness pool={pool} variant="full" />
          </div>
          <div data-testid="lite-expanded-panel">
            <ExpandedPanelHarness pool={pool} variant="lite" />
          </div>
        </div>
      </ComponentTestWrapper>,
    )

    cy.get('[data-testid="full-expanded-panel"]').within(() => {
      cy.get('[data-testid="pool-net-apy"]').should('have.text', '20.70%').find('img').should('not.exist')
      cy.get('[data-testid="pool-net-apy-cell"]').should('not.exist')
      cy.get('[data-testid="pool-crv-reward-badge"]').should('not.exist')
      cy.contains(/^Base APY$/).should('exist')
      cy.get('[data-testid="pool-base-apy-value"]').should('have.text', '10.51%')
      cy.contains(/^Weekly Base APY$/).should('exist')
      cy.get('[data-testid="pool-weekly-base-apy-value"]').should('have.text', '22.09%')
      cy.get(REWARDS_APY)
        .should('contain.text', '5.06%')
        .within(() => {
          cy.get(REWARD_BADGES).should('have.length', 2)
          cy.get(POINTS_BADGE).should('not.exist')
        })
      cy.get(GAUGE_APY).should('have.text', '5.12% \u2192 13.30%').find('img').should('not.exist')
      cy.get(POINTS).find(POINTS_BADGE).should('have.length', 3)
      cy.get(NET_APY_TOOLTIP_TRIGGER).should('not.exist')
      cy.get(REWARDS_APY_TOOLTIP_TRIGGER).should('not.exist')
      cy.get(GAUGE_APY_TOOLTIP_TRIGGER).should('not.exist')
    })
    cy.get('[data-testid="lite-expanded-panel"]').within(() => {
      cy.get('[data-testid="pool-net-apy"]').should('not.exist')
      cy.contains(/^Base APY$/).should('not.exist')
      cy.contains(/^Weekly Base APY$/).should('not.exist')
      cy.get('[data-testid="pool-weekly-base-apy-value"]').should('not.exist')
      cy.get(REWARDS_APY)
        .should('contain.text', '5.06%')
        .within(() => {
          cy.get(REWARD_BADGES).should('have.length', 2)
          cy.get(POINTS_BADGE).should('not.exist')
        })
      cy.get('[data-testid="pool-crv-reward-badge"]').should('not.exist')
      cy.get('[data-testid="pool-gauge-apy"]').should('not.exist')
      cy.get(POINTS).find(POINTS_BADGE).should('have.length', 3)
      cy.get(NET_APY_TOOLTIP_TRIGGER).should('not.exist')
      cy.get(REWARDS_APY_TOOLTIP_TRIGGER).should('not.exist')
      cy.get(GAUGE_APY_TOOLTIP_TRIGGER).should('not.exist')
    })

    cy.get('[data-testid="full-expanded-panel"] [data-testid="pool-net-apy"]').trigger('mouseover')
    cy.get('[role="tooltip"]').should('not.exist')

    cy.get('[data-testid="full-expanded-panel"] [data-testid="pool-rewards-apy"]').trigger('mouseover')
    cy.get('[role="tooltip"]').should('not.exist')

    cy.get('[data-testid="full-expanded-panel"] [data-testid="pool-gauge-apy"] > span').trigger('mouseover')
    cy.get('[role="tooltip"]')
      .should('be.visible')
      .and('contain.text', 'max boost of 2.50')
      .and('not.contain.text', 'Gauge APY')
    cy.get('[data-testid="full-expanded-panel"] [data-testid="pool-gauge-apy"] > span').trigger('mouseout')
    cy.get('[role="tooltip"]').should('not.exist')

    cy.get('[data-testid="full-expanded-panel"] [data-testid="pool-base-apy-value"] > span').trigger('mouseover')
    cy.get('[role="tooltip"]').should('be.visible').and('contain.text', 'Base APY').and('contain.text', 'Daily: 10.51%')
    cy.get('[data-testid="full-expanded-panel"] [data-testid="pool-base-apy-value"] > span').trigger('mouseout')
    cy.get('[role="tooltip"]').should('not.exist')

    cy.get('[data-testid="full-expanded-panel"] [data-testid="pool-weekly-base-apy-value"] > span').trigger('mouseover')
    cy.get('[role="tooltip"]')
      .should('be.visible')
      .and('contain.text', 'Weekly Base APY')
      .and('contain.text', 'Daily: 10.51%')
      .and('contain.text', 'Weekly: 22.09%')
  })

  it('supports every reward column on full networks and only rewards and points on lite networks', () => {
    const fullColumns = [
      PoolColumnId.NetApy,
      PoolColumnId.BaseApy,
      PoolColumnId.RewardsApy,
      PoolColumnId.GaugeApy,
      PoolColumnId.Points,
    ]

    fullColumns.forEach(column => {
      expect(getVisibilityOption('full', column)).to.include({ active: true, enabled: true })
    })

    expect(getVisibilityOption('full', PoolColumnId.WeeklyBaseApy)).to.include({ active: false, enabled: true })

    expect(getVisibilityOption('lite', PoolColumnId.RewardsApy)).to.include({ active: true, enabled: true })
    expect(getVisibilityOption('lite', PoolColumnId.Points)).to.include({ active: true, enabled: true })
    expect(getVisibilityOption('lite', PoolColumnId.NetApy)).to.include({ active: false, enabled: false })
    expect(getVisibilityOption('lite', PoolColumnId.BaseApy)).to.include({ active: false, enabled: false })
    expect(getVisibilityOption('lite', PoolColumnId.WeeklyBaseApy)).to.include({ active: false, enabled: false })
    expect(getVisibilityOption('lite', PoolColumnId.GaugeApy)).to.include({ active: false, enabled: false })

    const baseApyIndex = POOL_COLUMNS.findIndex(({ id }) => id === PoolColumnId.BaseApy)
    expect(POOL_COLUMNS[baseApyIndex + 1]?.id).to.equal(PoolColumnId.WeeklyBaseApy)
    expect(POOL_COLUMNS[baseApyIndex + 2]?.id).to.equal(PoolColumnId.RewardsApy)
  })
})
