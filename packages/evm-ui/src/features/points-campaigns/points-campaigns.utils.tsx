import type { CampaignRewards } from '@evm-ui/entities/campaigns'
import { RewardIcon } from '@evm-ui/shared/ui/RewardIcon'
import type { TokenInfoProps } from '@evm-ui/shared/ui/TokenInfo'
import { formatNumber } from '@evm-ui/utils'

export type PointsCampaignRow = {
  source: TokenInfoProps
  multiplier: string
  campaignUrl: string
}

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
