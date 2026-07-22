import { BaseApyCell } from '@/dex/features/pool-list/cells/BaseApyCell'
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
const BASE_APY_TOOLTIP_TRIGGER = '[data-testid="pool-base-apy-tooltip-trigger"]'
const REWARDS_APY_TOOLTIP_TRIGGER = '[data-testid="pool-rewards-apy-tooltip-trigger"]'
const GAUGE_APY_TOOLTIP_TRIGGER = '[data-testid="pool-gauge-apy-tooltip-trigger"]'
const GAUGE_APY = '[data-testid="pool-gauge-apy"]'
const GAUGE_APY_UNBOOSTED = '[data-testid="pool-gauge-apy-unboosted"]'
const GAUGE_APY_BOOSTED = '[data-testid="pool-gauge-apy-boosted"]'
const GAUGE_APY_CRV_ICON = `[data-testid="token-icon-${MAINNET_CRV_ADDRESS}"]`
const NET_APY_ICON_CONTEXTS = [NET_APY, REWARDS_APY] as const
const REWARD_BADGES = '[data-testid="pool-extra-reward-badge"], [data-testid="pool-campaign-reward-badge"]'
const NET_APY_BADGES = `${REWARD_BADGES}, [data-testid="pool-crv-reward-badge"]`

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
const BASE_APY_COLUMNS = [columnHelper.accessor('baseDailyApr', { cell: BaseApyCell })]

const BaseApyHarness = ({ pool }: { pool: PoolRow }) => {
  const table = useReactTable({
    data: [pool],
    columns: BASE_APY_COLUMNS,
    getCoreRowModel: getCoreRowModel(),
  })
  const [row] = table.getRowModel().rows
  const [cell] = row?.getVisibleCells() ?? []

  return (
    <div data-testid="pool-base-apy">{cell ? flexRender(cell.column.columnDef.cell, cell.getContext()) : null}</div>
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
    mountRewardCells(createPool())

    cy.get('[data-testid="pool-net-apy"]').should('have.text', '20.70%')
    cy.get('[data-testid="pool-base-apy"]').should('have.text', '10.51%').find('img').should('not.exist')
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
      cy.get(NET_APY_BADGES).should('have.length', 3)
      cy.get(NET_APY_BADGES).eq(0).should('have.attr', 'data-testid', 'pool-extra-reward-badge')
      cy.get(NET_APY_BADGES).eq(1).should('have.attr', 'data-testid', 'pool-campaign-reward-badge')
      cy.get(NET_APY_BADGES).eq(2).should('have.attr', 'data-testid', 'pool-crv-reward-badge')
    })
    cy.get(REWARDS_APY).within(() => {
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
      .and('contain.text', 'Direct incentives APY')
      .and('contain.text', '2.02%')
      .and('contain.text', 'Campaign rewards APY')
      .and('contain.text', '3.04%')
      .and('contain.text', 'BONUS')
      .and('contain.text', 'Gauge APY')
      .and('contain.text', 'Unboosted')
      .and('contain.text', '5.12%')
      .and('contain.text', 'Net APY')
      .and('contain.text', '20.70%')
      .and('not.contain.text', '5.06%')
      .and('not.contain.text', 'Maximum')
      .and('not.contain.text', '13.30%')
      .and('contain.text', 'Points are not included in Net APY.')
      .find('img')
      .should('have.length', 3)
    cy.get('[data-testid="pool-net-apy-tooltip-content"] span').then($spans => {
      expect($spans.filter((_, element) => element.textContent === 'Rewards APY')).to.have.length(0)
    })
    cy.get('[data-testid="pool-net-apy-tooltip-content"] > .MuiStack-root')
      .children()
      .last()
      .should('have.text', 'Points are not included in Net APY.')
    cy.get(NET_APY_TOOLTIP_TRIGGER).trigger('mouseout')
    cy.get('[role="tooltip"]').should('not.exist')

    cy.get(REWARDS_APY_TOOLTIP_TRIGGER).trigger('mouseover')
    cy.get('[role="tooltip"]')
      .should('be.visible')
      .and('contain.text', 'Direct incentives APY')
      .and('contain.text', '2.02%')
      .and('contain.text', 'Campaign rewards APY')
      .and('contain.text', '3.04%')
      .and('contain.text', 'BONUS')
      .and('contain.text', 'Rewards APY')
      .and('contain.text', '5.06%')
      .and('contain.text', 'Points are not included.')
      .find('img')
      .should('have.length', 2)
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

    cy.get(BASE_APY_TOOLTIP_TRIGGER).trigger('mouseover')
    cy.get('[role="tooltip"]')
      .should('be.visible')
      .and('contain.text', 'Base APY')
      .find('.MuiTypography-bodyMBold')
      .should('have.text', 'Base APY')

    cy.get('[data-testid="pool-base-apy-tooltip-content"]')
      .should(
        'contain.text',
        'Annualized yield generated by the pool, shown using daily and weekly measurement windows. If the pool contains yield-bearing assets, their intrinsic yield is included.',
      )
      .should('contain.text', 'Daily')
      .and('contain.text', '10.51%')
      .and('contain.text', 'Weekly')
      .and('contain.text', '22.09%')
      .and('not.contain.text', 'Base APY')
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
  })

  it('shows the individual APY and source details in reward tooltips', () => {
    mountRewardCells(createPool())

    NET_APY_ICON_CONTEXTS.forEach(context => {
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
      cy.get('[data-testid="pool-extra-reward-badge"]').should('have.length', 2)
      cy.get('[data-testid="pool-campaign-reward-badge"]').should('have.length', 2)
      cy.get(NET_APY_BADGES).should('have.length', 5).last().should('have.attr', 'data-testid', 'pool-crv-reward-badge')
    })
    cy.get(REWARDS_APY).within(() => {
      cy.get('[data-testid="pool-extra-reward-badge"]').should('have.length', 2)
      cy.get('[data-testid="pool-campaign-reward-badge"]').should('have.length', 2)
      cy.get('[data-testid="pool-crv-reward-badge"]').should('not.exist')
    })

    cy.get(REWARDS_APY_TOOLTIP_TRIGGER).trigger('mouseover')
    cy.get('[role="tooltip"]').within(() => {
      cy.contains('Direct incentives APY').should('exist')
      cy.contains('Campaign rewards APY').should('exist')
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

    cy.get('[data-testid="pool-points"]').should('have.css', 'grid-auto-flow', 'column')
    cy.get('[data-testid="pool-points-badge"]').should('have.length', 4)
    cy.get('[data-testid="pool-points-badge"]')
      .eq(0)
      .children()
      .children()
      .first()
      .should('have.text', '2x')
      .next()
      .should('match', 'img')
    cy.get('[data-testid="pool-points-badge"]').eq(1).should('contain.text', 'XP')
    cy.get('[data-testid="pool-points-badge"]').eq(2).should('contain.text', 'Points')
    cy.get('[data-testid="pool-points-badge"]').eq(3).should('contain.text', 'FOUR')
    cy.get('[data-testid="pool-points"]').should('not.contain.text', 'FIVE')
    cy.get('[data-testid="pool-rewards-apy"]').should('contain.text', '5.06%').and('not.contain.text', '2x')
    cy.get('[data-testid="pool-net-apy"]').should('have.text', '20.70%')
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
    cy.get('[data-testid="pool-points-badge"]').should('have.length', 3)
    cy.get('[data-testid="pool-net-apy-cell"] [data-testid="pool-crv-reward-badge"]').should('not.exist')
    cy.get('[data-testid="pool-net-apy-cell"]')
      .find('[data-testid="pool-extra-reward-badge"], [data-testid="pool-campaign-reward-badge"]')
      .should('have.length', 2)

    cy.get(GAUGE_APY).trigger('mouseover')
    cy.get('[role="tooltip"]').should('not.exist')

    cy.get(NET_APY_TOOLTIP_TRIGGER).trigger('mouseover')
    cy.get('[role="tooltip"]')
      .should('be.visible')
      .and('contain.text', 'Net APY')
      .and('contain.text', '15.57%')
      .and('not.contain.text', 'Gauge APY')
      .and('not.contain.text', 'Inactive gauge')
      .and('not.contain.text', 'Unboosted')
      .and('not.contain.text', 'Maximum')
      .and('contain.text', 'Points are not included in Net APY.')
    cy.get('[data-testid="pool-net-apy-tooltip-content"] > .MuiStack-root')
      .children()
      .last()
      .should('have.text', 'Points are not included in Net APY.')
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
        campaigns: [],
      }),
    )

    cy.get('[data-testid="pool-net-apy"]').should('have.text', '-')
    cy.get('[data-testid="pool-base-apy"]').should('have.text', '-')
    cy.get('[data-testid="pool-rewards-apy"]').should('have.text', '-')
    cy.get(GAUGE_APY)
      .should('have.text', '-')
      .within(() => {
        cy.get(GAUGE_APY_BOOSTED).should('not.exist')
        cy.get(GAUGE_APY_CRV_ICON).should('not.exist')
      })
    cy.get('[data-testid="pool-points"]').should('have.text', '-')
    cy.get('[data-testid="pool-net-apy-cell"] [data-testid$="-reward-badge"]').should('not.exist')
    cy.get(NET_APY_TOOLTIP_TRIGGER).should('not.exist')
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
    cy.get(REWARDS_APY_TOOLTIP_TRIGGER).should('not.exist')
    cy.get(GAUGE_APY_TOOLTIP_TRIGGER).should('not.exist')

    cy.get(GAUGE_APY).trigger('mouseover')
    cy.get('[role="tooltip"]').should('not.exist')
  })

  it('preserves negative Base APY values and their warning', () => {
    mountRewardCells(
      createPool({
        baseDailyApr: -10,
        baseWeeklyApr: -10,
        crvApr: null,
        crvAprBoosted: null,
        extraRewardsApr: [],
        campaigns: [],
      }),
    )

    cy.get('[data-testid="pool-net-apy"]')
      .invoke('text')
      .should('match', /^-\d+\.\d+%$/)
    cy.get('[data-testid="pool-base-apy"]')
      .invoke('text')
      .should('match', /^-\d+\.\d+%$/)
    cy.get(BASE_APY_TOOLTIP_TRIGGER).trigger('mouseover')
    cy.get('[role="tooltip"]').should('contain.text', 'Base vAPY can temporarily be negative')
  })

  it('shows the rich volatile Net APY warning while retaining the Base and mobile chip tooltips', () => {
    const pool = createPool({ baseDailyApr: 5_000 })

    mountRewardCells(pool)

    cy.get('[data-testid="pool-net-apy"]').should('contain.text', '5,000+%')
    cy.get('[data-testid="pool-base-apy"]').should('contain.text', '5,000+%')
    cy.get('[data-testid="pool-net-apy-cell"] [data-testid$="-reward-badge"]').should('have.length', 3)
    cy.get(BASE_APY_TOOLTIP_TRIGGER).should('not.exist')

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
        baseWeeklyApr: 400,
        crvApr: null,
        crvAprBoosted: null,
        extraRewardsApr: [{ ...createPool().extraRewardsApr[0], apr: 200 }],
        campaigns: [],
      }),
    )

    cy.get('[data-testid="pool-net-apy"]').should('not.contain.text', '5,000+%')
    cy.get('[data-testid="pool-base-apy"]').should('not.contain.text', '5,000+%')
  })

  it('only displays Gauge APY when both endpoints are non-zero', () => {
    const partialRanges = [
      { range: { crvApr: 0, crvAprBoosted: 12.5 }, showsGaugeInNetApy: false },
      { range: { crvApr: null, crvAprBoosted: 12.5 }, showsGaugeInNetApy: false },
      { range: { crvApr: 5, crvAprBoosted: null }, showsGaugeInNetApy: true },
    ]

    partialRanges.forEach(({ range, showsGaugeInNetApy }) => {
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
      cy.get('[role="tooltip"]')
        .should('be.visible')
        .and(showsGaugeInNetApy ? 'contain.text' : 'not.contain.text', 'Gauge APY')
        .and(showsGaugeInNetApy ? 'contain.text' : 'not.contain.text', 'Unboosted')
        .and(showsGaugeInNetApy ? 'contain.text' : 'not.contain.text', '5.12%')
        .and('not.contain.text', 'Maximum')
        .and('not.contain.text', '13.30%')
        .and('contain.text', 'Points are not included in Net APY.')
      cy.get(NET_APY_TOOLTIP_TRIGGER).trigger('mouseout')
      cy.get('[role="tooltip"]').should('not.exist')
    })
  })

  it('uses the full and lite reward support in the mobile expanded panel', () => {
    const pool = createPool()

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
      cy.contains('Base APY').should('exist')
      cy.get('[data-testid="pool-base-apy-value"]').should('have.text', '10.51%')
      cy.get('[data-testid="pool-rewards-apy"]').should('contain.text', '5.06%')
      cy.get('[data-testid="pool-extra-reward-badge"], [data-testid="pool-campaign-reward-badge"]').should(
        'have.length',
        2,
      )
      cy.get(GAUGE_APY).should('have.text', '5.12% \u2192 13.30%').find('img').should('not.exist')
      cy.get('[data-testid="pool-points-badge"]').should('have.length', 3)
      cy.get(NET_APY_TOOLTIP_TRIGGER).should('not.exist')
      cy.get(REWARDS_APY_TOOLTIP_TRIGGER).should('not.exist')
      cy.get(GAUGE_APY_TOOLTIP_TRIGGER).should('not.exist')
    })
    cy.get('[data-testid="lite-expanded-panel"]').within(() => {
      cy.get('[data-testid="pool-net-apy"]').should('not.exist')
      cy.contains('Base APY').should('not.exist')
      cy.get('[data-testid="pool-rewards-apy"]').should('contain.text', '5.06%')
      cy.get('[data-testid="pool-extra-reward-badge"], [data-testid="pool-campaign-reward-badge"]').should(
        'have.length',
        2,
      )
      cy.get('[data-testid="pool-crv-reward-badge"]').should('not.exist')
      cy.get('[data-testid="pool-gauge-apy"]').should('not.exist')
      cy.get('[data-testid="pool-points-badge"]').should('have.length', 3)
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
    cy.get('[role="tooltip"]').should('be.visible').and('contain.text', 'Pool APY').and('contain.text', 'Daily: 10.51%')
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

    expect(getVisibilityOption('lite', PoolColumnId.RewardsApy)).to.include({ active: true, enabled: true })
    expect(getVisibilityOption('lite', PoolColumnId.Points)).to.include({ active: true, enabled: true })
    expect(getVisibilityOption('lite', PoolColumnId.NetApy)).to.include({ active: false, enabled: false })
    expect(getVisibilityOption('lite', PoolColumnId.BaseApy)).to.include({ active: false, enabled: false })
    expect(getVisibilityOption('lite', PoolColumnId.GaugeApy)).to.include({ active: false, enabled: false })
  })
})
