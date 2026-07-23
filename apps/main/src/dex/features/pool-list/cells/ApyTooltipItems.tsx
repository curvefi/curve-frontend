import ArrowOutwardIcon from '@mui/icons-material/ArrowOutward'
import Link from '@mui/material/Link'
import Stack from '@mui/material/Stack'
import { t } from '@ui-kit/lib/i18n'
import { RewardIcon } from '@ui-kit/shared/ui/RewardIcon'
import { TooltipItem, TooltipItems } from '@ui-kit/shared/ui/TooltipComponents'
import { TRANSITION_FUNCTION } from '@ui-kit/themes/design/0_primitives'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import { formatNumber, MAINNET_CRV } from '@ui-kit/utils'
import type { PoolRow } from '../types'
import {
  aprToPoolApy,
  getAprCampaigns,
  getCampaignRewardsApy,
  getExtraRewards,
  getExtraRewardsApy,
  getRewardsApy,
  isPointsCampaign,
} from './utils'

const { Spacing } = SizesAndSpaces

const formatApy = (apy: number | null | undefined) => formatNumber(apy || null, 'percent.rate')

type ExtraReward = PoolRow['extraRewardsApr'][number]
type Campaign = PoolRow['campaigns'][number]

const ExtraRewardTooltipItems = ({ network, rewards }: { network: string; rewards: ExtraReward[] }) =>
  rewards.map((reward, index) => (
    <TooltipItem
      // eslint-disable-next-line @eslint-react/no-array-index-key -- API reward rows do not provide a stable unique id and duplicates must remain visible.
      key={`${reward.address}-${reward.symbol}-${index}`}
      variant="subItem"
      title={reward.symbol || reward.name || t`Extra reward`}
      titleIcon={reward.address ? { blockchainId: network, address: reward.address, size: 'mui-sm' } : undefined}
    >
      {formatApy(aprToPoolApy(reward.apr))}
    </TooltipItem>
  ))

const CampaignRewardTooltipItems = ({ campaigns }: { campaigns: Campaign[] }) =>
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
      {formatApy(campaign.reward?.type === 'apr' ? aprToPoolApy(campaign.reward.value) : null)}
    </TooltipItem>
  ))

const PointsTooltipItems = ({ campaigns }: { campaigns: Campaign[] }) =>
  campaigns.map((campaign, index) => (
    <TooltipItem
      // eslint-disable-next-line @eslint-react/no-array-index-key -- Campaigns may describe distinct point rewards with the same platform metadata.
      key={`${campaign.platform}-${campaign.description}-${index}`}
      variant="subItem"
      title={t`Points`}
      titleAdornment={<RewardIcon src={campaign.platformImageId} alt={campaign.platform} size="md" />}
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

export const RewardsApyTooltipItems = ({ pool }: { pool: PoolRow }) => {
  const extraRewards = getExtraRewards(pool)
  const campaigns = getAprCampaigns(pool)

  return (
    <>
      {extraRewards.length > 0 && (
        <TooltipItems secondary>
          <TooltipItem title={t`Incentives`}>{formatApy(getExtraRewardsApy(pool))}</TooltipItem>
          <ExtraRewardTooltipItems network={pool.network} rewards={extraRewards} />
        </TooltipItems>
      )}
      {campaigns.length > 0 && (
        <TooltipItems secondary>
          <TooltipItem title={t`Campaign rewards`}>{formatApy(getCampaignRewardsApy(pool))}</TooltipItem>
          <CampaignRewardTooltipItems campaigns={campaigns} />
        </TooltipItems>
      )}
      <TooltipItems borderTop>
        <TooltipItem variant="primary" title={t`Rewards APY`}>
          {formatApy(getRewardsApy(pool))}
        </TooltipItem>
      </TooltipItems>
    </>
  )
}

export const NetApyIncentivesTooltipItems = ({
  pool,
  unboostedGaugeApy,
}: {
  pool: PoolRow
  unboostedGaugeApy: number | null | undefined
}) => {
  const extraRewards = getExtraRewards(pool)
  const campaigns = getAprCampaigns(pool)
  const pointsCampaigns = pool.campaigns.filter(isPointsCampaign)
  const hasGaugeApy = unboostedGaugeApy != null && unboostedGaugeApy !== 0

  if (!hasGaugeApy && !extraRewards.length && !campaigns.length && !pointsCampaigns.length) return null

  return (
    <TooltipItems secondary>
      <TooltipItem title={t`Incentives`}>
        {formatApy(getRewardsApy(pool) + (hasGaugeApy ? unboostedGaugeApy : 0))}
      </TooltipItem>
      {hasGaugeApy && (
        <TooltipItem
          variant="subItem"
          title="CRV"
          titleIcon={{ blockchainId: MAINNET_CRV.chain, address: MAINNET_CRV.address, size: 'mui-sm' }}
        >
          {formatApy(unboostedGaugeApy)}
        </TooltipItem>
      )}
      <ExtraRewardTooltipItems network={pool.network} rewards={extraRewards} />
      <CampaignRewardTooltipItems campaigns={campaigns} />
      <PointsTooltipItems campaigns={pointsCampaigns} />
    </TooltipItems>
  )
}
