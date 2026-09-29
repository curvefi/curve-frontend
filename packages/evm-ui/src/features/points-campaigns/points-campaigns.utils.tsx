import type { CampaignRewards } from '@evm-ui/queries/campaigns'
import { formatNumber } from '@primitives/number.utils'
import { RewardIcon } from '@ui/components/RewardIcon'
import type { TokenInfoProps } from '@ui/components/TokenInfo'

export type PointsCampaignRow = { source: TokenInfoProps; multiplier: string; campaignUrl: string }

/** Converts points rewards, including legacy symbolic multipliers, into shared table rows. */
export const getPointsCampaignRows = (campaigns: CampaignRewards[]): PointsCampaignRow[] =>
  campaigns
    .filter(({ reward, symbol }) => reward?.type === 'points' || (!reward?.type && symbol))
    .map(({ dashboardLink, reward, platform, platformImageId, symbol }) => ({
      source: {
        icon: <RewardIcon src={platformImageId} alt={platform} size="lg" />,
        iconPosition: 'left',
        primary: platform,
      },
      multiplier: reward?.value != null || symbol == null ? formatNumber(reward?.value, 'multiplier') : symbol,
      campaignUrl: dashboardLink,
    }))
