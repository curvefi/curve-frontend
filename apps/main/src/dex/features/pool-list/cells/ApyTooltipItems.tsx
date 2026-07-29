import ArrowOutwardIcon from '@mui/icons-material/ArrowOutward'
import Link from '@mui/material/Link'
import Stack from '@mui/material/Stack'
import { t } from '@ui-kit/lib/i18n'
import { RewardIcon } from '@ui-kit/shared/ui/RewardIcon'
import { TooltipItem } from '@ui-kit/shared/ui/TooltipComponents'
import { TRANSITION_FUNCTION } from '@ui-kit/themes/design/0_primitives'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import { formatNumber } from '@ui-kit/utils'
import type { PoolRow } from '../types'
import { aprToPoolApy } from './utils'

const { Spacing } = SizesAndSpaces

type ExtraReward = PoolRow['extraRewardsApr'][number]
type Campaign = PoolRow['campaigns'][number]

export const ExtraRewardTooltipItems = ({ network, rewards }: { network: string; rewards: ExtraReward[] }) =>
  rewards.map((reward, index) => (
    <TooltipItem
      // eslint-disable-next-line @eslint-react/no-array-index-key -- API reward rows do not provide a stable unique id and duplicates must remain visible.
      key={`${reward.address}-${reward.symbol}-${index}`}
      variant="subItem"
      title={reward.symbol || reward.name || t`Extra reward`}
      titleIcon={reward.address ? { blockchainId: network, address: reward.address, size: 'mui-sm' } : undefined}
    >
      {formatNumber(aprToPoolApy(reward.apr), 'percent.rate')}
    </TooltipItem>
  ))

export const CampaignRewardTooltipItems = ({ campaigns }: { campaigns: Campaign[] }) =>
  campaigns.map((campaign, index) => (
    <TooltipItem
      // eslint-disable-next-line @eslint-react/no-array-index-key -- Campaigns may describe distinct rewards with the same platform metadata.
      key={`${campaign.platform}-${campaign.description}-${index}`}
      variant="subItem"
      title={campaign.symbol || campaign.campaignName || campaign.platform || t`Campaign reward`}
      titleAdornment={
        <RewardIcon src={campaign.platformImageId} alt={campaign.platform} size="sm" sx={{ borderRadius: '50%' }} />
      }
    >
      {formatNumber(campaign.reward?.type === 'apr' ? aprToPoolApy(campaign.reward.value) : null, 'percent.rate')}
    </TooltipItem>
  ))

export const PointsTooltipItems = ({ campaigns }: { campaigns: Campaign[] }) =>
  campaigns.map((campaign, index) => (
    <TooltipItem
      // eslint-disable-next-line @eslint-react/no-array-index-key -- Campaigns may describe distinct point rewards with the same platform metadata.
      key={`${campaign.platform}-${campaign.description}-${index}`}
      variant="subItem"
      title={t`Points`}
      titleAdornment={<RewardIcon src={campaign.platformImageId} alt={campaign.platform} size="sm" />}
    >
      <Stack
        component={Link}
        href={campaign.dashboardLink}
        target="_blank"
        direction="row"
        sx={{
          alignItems: 'center',
          gap: Spacing.xs,
          textDecoration: 'none',
          color: theme => theme.design.Text.TextColors.Secondary,
          svg: { fontSize: 0, transition: `font-size ${TRANSITION_FUNCTION}` },
          '&:hover svg': { fontSize: 20 },
        }}
      >
        {campaign.reward?.type === 'points'
          ? formatNumber(campaign.reward.value, 'multiplier')
          : campaign.symbol || '-'}
        <ArrowOutwardIcon />
      </Stack>
    </TooltipItem>
  ))
