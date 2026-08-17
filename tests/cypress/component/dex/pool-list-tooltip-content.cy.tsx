import type { ReactElement } from 'react'
import { BaseApyTooltipContent } from '@/dex/components/BaseApyTooltipContent'
import { CrvApyTooltipContent } from '@/dex/components/CrvApyTooltipContent'
import { NetApyTooltipContent } from '@/dex/features/pool-list/cells/NetApyTooltipContent'
import { CampaignTooltipContent } from '@/dex/features/pool-list/cells/RewardIcons'
import { RewardsApyTooltipContent } from '@/dex/features/pool-list/cells/RewardsApyTooltipContent'
import { aprToPoolApy } from '@/dex/features/pool-list/cells/utils'
import type { PoolRow } from '@/dex/features/pool-list/types'
import { ComponentTestWrapper } from '@cy/support/helpers/ComponentTestWrapper'
import type { CampaignRewards } from '@ui-kit/entities/campaigns'

const CONTENT = '[data-testid="pool-tooltip-content"]'
const POOL_ADDRESS = '0xefc6516323fbd28e80b85a497b65a86243a54b3e'
const GAUGE_ADDRESS = '0x07a01471fa544d9c6531b631e6a96a79a9ad05e9'
const POINTS_CAMPAIGN_LINK = 'https://www.liquity.org/forks/'
const APR_CAMPAIGN_LINK = 'https://www.liquity.org/'
const CAMPAIGN_ICON = 'https://cdn.jsdelivr.net/gh/curvefi/curve-assets/platforms/liquity.png'

const BOLD = {
  symbol: 'BOLD',
  address: '0x6440f144b7e50d6a8439336510312d2f54beb01d',
  name: 'BOLD Stablecoin',
  decimals: 18,
} as const
const USDC = {
  symbol: 'USDC',
  address: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
  name: 'USD Coin',
  decimals: 6,
} as const
const EXTRA_REWARD = {
  address: BOLD.address,
  apr: 2,
  name: BOLD.name,
  symbol: BOLD.symbol,
} satisfies PoolRow['extraRewardsApr'][number]

const BOLD_CAMPAIGN: CampaignRewards = {
  campaignName: 'Friendly Fork Program',
  platform: 'Liquity',
  platformImageId: CAMPAIGN_ICON,
  dashboardLink: POINTS_CAMPAIGN_LINK,
  action: 'lp',
  tags: ['points'],
  address: POOL_ADDRESS,
  network: 'ethereum',
  description:
    'Providing liquidity earns you additional rewards from 15+ friendly forks. For more information please visit issuer.',
  lock: false,
  symbol: '15+',
}

const BOLD_APR_CAMPAIGN: CampaignRewards = {
  ...BOLD_CAMPAIGN,
  campaignName: 'BOLD liquidity rewards',
  dashboardLink: APR_CAMPAIGN_LINK,
  tags: ['tokens'],
  description: 'Earn BOLD by providing liquidity.',
  reward: { type: 'apr', value: 3, address: BOLD.address },
  symbol: BOLD.symbol,
}

const createPool = (): PoolRow => ({
  name: 'BOLD/USDC Pool',
  address: POOL_ADDRESS,
  coins: [BOLD, USDC].map((token, poolIndex) => ({ poolIndex, ...token })),
  tradeableCoins: [BOLD, USDC].map((token, poolIndex) => ({ poolIndex, ...token })),
  baseDailyApr: 10,
  baseWeeklyApr: undefined,
  creationDate: undefined,
  crvApr: 5,
  crvAprBoosted: 12.5,
  extraRewardsApr: [EXTRA_REWARD],
  gauge: { address: GAUGE_ADDRESS, isKilled: false },
  gauges: [{ address: GAUGE_ADDRESS, isKilled: false }],
  campaigns: [BOLD_CAMPAIGN, BOLD_APR_CAMPAIGN],
  hasPosition: false,
  hasVyperVulnerability: false,
  isMetapool: false,
  network: 'ethereum',
  poolType: undefined,
  tradingVolume24h: undefined,
  tvlUsd: undefined,
  url: `/dex/ethereum/pools/${POOL_ADDRESS}/deposit`,
})

const mountContent = (content: ReactElement) =>
  cy.mount(
    <ComponentTestWrapper>
      <div data-testid="pool-tooltip-content">{content}</div>
    </ComponentTestWrapper>,
  )

const expectContent = (expected: readonly string[]) => {
  for (const text of expected) cy.get(CONTENT).should('contain.text', text)
}

const expectLink = (href: string, text: string) =>
  cy.get(`${CONTENT} a[href="${href}"]`).should('have.text', text).and('have.attr', 'target', '_blank')

describe('V2 pool-list tooltip content', () => {
  it('renders Base and CRV APY breakdowns without a tooltip wrapper', () => {
    mountContent(<BaseApyTooltipContent dailyApy={aprToPoolApy(10)} weeklyApy={aprToPoolApy(20)} />)
    cy.get(CONTENT).should('contain.text', 'past 24 hours')
    expectContent(['Daily10.51%', 'Weekly22.09%'])

    mountContent(<BaseApyTooltipContent dailyApy={0} weeklyApy={null} weekly />)
    cy.get(CONTENT).should('contain.text', 'past 7 days')
    expectContent(['Daily0%', 'Weekly-'])

    mountContent(<BaseApyTooltipContent dailyApy={aprToPoolApy(10)} weeklyApy={aprToPoolApy(-10)} />)
    cy.get(CONTENT).should('contain.text', 'Base APY can temporarily be negative')

    mountContent(<CrvApyTooltipContent unboostedApy={aprToPoolApy(5)} maximumApy={aprToPoolApy(12.5)} />)
    expectContent(['Unboosted5.12%', 'Max boost13.30%'])
  })

  it('renders the complete Net APY breakdown and BOLD campaign links', () => {
    mountContent(<NetApyTooltipContent pool={createPool()} volatile={false} />)

    expectContent([
      'Base APY10.51%',
      'Liquidity incentives10.19%',
      'CRV5.12%',
      'BOLD2.02%',
      'BOLD3.04%',
      'Net total APY20.70%',
      'Max veCRV Boost (2.5x)13.30%',
      'Total max veCRV APY28.87%',
      'Points15+',
    ])
    cy.get(CONTENT).should('contain.text', 'weekly compounding rate').and('not.contain.text', 'unlikely to persist')
    expectLink(APR_CAMPAIGN_LINK, '3.04%')
    expectLink(POINTS_CAMPAIGN_LINK, '15+')
  })

  it('renders the volatile Net APY warning', () => {
    mountContent(<NetApyTooltipContent pool={createPool()} volatile />)
    cy.get(CONTENT).should('contain.text', 'This net APY is volatile and is unlikely to persist.')
  })

  it('renders the Rewards APY breakdown', () => {
    mountContent(<RewardsApyTooltipContent pool={createPool()} />)
    expectContent(['Liquidity incentives2.02%', 'BOLD2.02%', 'Campaign rewards3.04%', 'BOLD3.04%', 'Rewards APY5.06%'])
    expectLink(APR_CAMPAIGN_LINK, '3.04%')
  })

  it('renders points and APR campaign details directly', () => {
    mountContent(<CampaignTooltipContent campaign={BOLD_CAMPAIGN} showApy={false} />)

    cy.get(CONTENT)
      .should('contain.text', 'Friendly Fork Program')
      .and('contain.text', 'by Liquity')
      .and(
        'contain.text',
        'Providing liquidity earns you additional rewards from 15+ friendly forks. For more information please visit issuer.',
      )
      .and('not.contain.text', 'APY:')
    expectLink(POINTS_CAMPAIGN_LINK, 'Go to issuer')

    mountContent(<CampaignTooltipContent campaign={BOLD_APR_CAMPAIGN} showApy />)
    expectContent(['APY: 3.04%', 'BOLD liquidity rewards', 'Earn BOLD by providing liquidity.'])
    expectLink(APR_CAMPAIGN_LINK, 'Go to issuer')
  })
})
