import type { ReactElement } from 'react'
import { BaseRateTooltipContent } from '@/dex/components/BaseRateTooltipContent'
import { CrvRateTooltipContent } from '@/dex/components/CrvRateTooltipContent'
import { NetRateTooltipContent } from '@/dex/features/pool-list/cells/NetRateTooltipContent'
import { CampaignTooltipContent } from '@/dex/features/pool-list/cells/RewardIcons'
import { RewardsRateTooltipContent } from '@/dex/features/pool-list/cells/RewardsRateTooltipContent'
import type { PoolRow } from '@/dex/features/pool-list/types'
import { ComponentTestWrapper } from '@cy/support/helpers/ComponentTestWrapper'
import type { CampaignRewards } from '@evm-ui/entities/campaigns'
import { Chain } from '@evm-ui/utils/network'

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
  chainId: Chain.Ethereum,
  blockchainId: 'ethereum',
  poolType: undefined,
  tradingVolume24h: undefined,
  tvlUsd: undefined,
  url: `/dex/ethereum/pools/${POOL_ADDRESS}`,
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
  it('renders Base and CRV APR breakdowns without a tooltip wrapper', () => {
    mountContent(<BaseRateTooltipContent dailyRate={10} weeklyRate={20} />)
    cy.get(CONTENT).should('contain.text', 'past 24 hours')
    expectContent(['Daily10%', 'Weekly20%'])

    mountContent(<BaseRateTooltipContent dailyRate={0} weeklyRate={null} weekly />)
    cy.get(CONTENT).should('contain.text', 'past 7 days')
    expectContent(['Daily0%', 'Weekly-'])

    mountContent(<BaseRateTooltipContent dailyRate={10} weeklyRate={-10} />)
    cy.get(CONTENT).should('contain.text', 'Base APR can temporarily be negative')

    mountContent(<CrvRateTooltipContent unboostedRate={5} maximumRate={12.5} />)
    expectContent(['Unboosted5%', 'Max boost12.50%'])
  })

  it('renders the complete Net APR breakdown and BOLD campaign links', () => {
    mountContent(<NetRateTooltipContent pool={createPool()} volatile={false} />)

    expectContent([
      'Base APR10%',
      'Liquidity incentives10%',
      'CRV5%',
      'BOLD2%',
      'BOLD3%',
      'Net total APR20%',
      'Max veCRV Boost (2.5x)12.50%',
      'Total max veCRV APR27.50%',
      'Points15+',
    ])
    cy.get(CONTENT).and('not.contain.text', 'unlikely to persist')
    expectLink(APR_CAMPAIGN_LINK, '3%')
    expectLink(POINTS_CAMPAIGN_LINK, '15+')
  })

  it('renders the volatile Net rate warning', () => {
    mountContent(<NetRateTooltipContent pool={createPool()} volatile />)
    cy.get(CONTENT).should('contain.text', 'This net rate is volatile and is unlikely to persist.')
  })

  it('renders the Rewards APR breakdown', () => {
    mountContent(<RewardsRateTooltipContent pool={createPool()} />)
    expectContent(['Liquidity incentives2%', 'BOLD2%', 'Campaign rewards3%', 'BOLD3%', 'Rewards APR5%'])
    expectLink(APR_CAMPAIGN_LINK, '3%')
  })

  it('renders points and APR campaign details directly', () => {
    mountContent(<CampaignTooltipContent campaign={BOLD_CAMPAIGN} showRate={false} />)

    cy.get(CONTENT)
      .should('contain.text', 'Friendly Fork Program')
      .and('contain.text', 'by Liquity')
      .and(
        'contain.text',
        'Providing liquidity earns you additional rewards from 15+ friendly forks. For more information please visit issuer.',
      )
      .and('not.contain.text', 'APR:')
    expectLink(POINTS_CAMPAIGN_LINK, 'Go to issuer')

    mountContent(<CampaignTooltipContent campaign={BOLD_APR_CAMPAIGN} showRate />)
    expectContent(['APR: 3%', 'BOLD liquidity rewards', 'Earn BOLD by providing liquidity.'])
    expectLink(APR_CAMPAIGN_LINK, 'Go to issuer')
  })
})
