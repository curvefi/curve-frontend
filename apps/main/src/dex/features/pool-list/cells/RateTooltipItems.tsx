import { useAprToApy } from '@evm-ui/hooks/useAprToApy'
import { t } from '@evm-ui/lib/i18n'
import { RewardIcon } from '@evm-ui/shared/ui/RewardIcon'
import { TooltipItem, TooltipValueLink } from '@evm-ui/shared/ui/TooltipComponents'
import { formatNumber } from '@evm-ui/utils'
import type { PoolRow } from '../types'
import { convertPoolRate } from './utils'

type ExtraReward = PoolRow['extraRewardsApr'][number]
type Campaign = PoolRow['campaigns'][number]

export const ExtraRewardTooltipItems = ({ network, rewards }: { network: string; rewards: ExtraReward[] }) => {
  const convertAprToApy = useAprToApy()

  return rewards.map((reward, index) => (
    <TooltipItem
      // eslint-disable-next-line @eslint-react/no-array-index-key -- API reward rows do not provide a stable unique id and duplicates must remain visible.
      key={`${reward.address}-${reward.symbol}-${index}`}
      variant="subItem"
      title={reward.symbol || reward.name || t`Extra reward`}
      titleIcon={reward.address ? { blockchainId: network, address: reward.address, size: 'mui-sm' } : undefined}
    >
      {formatNumber(convertPoolRate(convertAprToApy, reward.apr), 'percent.rate')}
    </TooltipItem>
  ))
}

export const CampaignRewardTooltipItems = ({ campaigns }: { campaigns: Campaign[] }) => {
  const convertAprToApy = useAprToApy()

  return campaigns.map((campaign, index) => (
    <TooltipItem
      // eslint-disable-next-line @eslint-react/no-array-index-key -- Campaigns may describe distinct rewards with the same platform metadata.
      key={`${campaign.platform}-${campaign.description}-${index}`}
      variant="subItem"
      title={campaign.symbol || campaign.campaignName || campaign.platform || t`Campaign reward`}
      titleAdornment={<RewardIcon src={campaign.platformImageId} alt={campaign.platform} size="sm" />}
    >
      <TooltipValueLink href={campaign.dashboardLink}>
        {formatNumber(
          campaign.reward?.type === 'apr' ? convertPoolRate(convertAprToApy, campaign.reward.value) : null,
          'percent.rate',
        )}
      </TooltipValueLink>
    </TooltipItem>
  ))
}

export const PointsTooltipItems = ({ campaigns }: { campaigns: Campaign[] }) =>
  campaigns.map((campaign, index) => (
    <TooltipItem
      // eslint-disable-next-line @eslint-react/no-array-index-key -- Campaigns may describe distinct point rewards with the same platform metadata.
      key={`${campaign.platform}-${campaign.description}-${index}`}
      variant="subItem"
      title={t`Points`}
      titleAdornment={<RewardIcon src={campaign.platformImageId} alt={campaign.platform} size="sm" />}
    >
      <TooltipValueLink href={campaign.dashboardLink}>
        {campaign.reward?.type === 'points'
          ? formatNumber(campaign.reward.value, 'multiplier')
          : campaign.symbol || '-'}
      </TooltipValueLink>
    </TooltipItem>
  ))
