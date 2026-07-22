import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import Typography, { type TypographyProps } from '@mui/material/Typography'
import { TooltipMessage } from '@ui/CampaignRewards/TooltipMessage'
import type { CampaignRewards } from '@ui-kit/entities/campaigns'
import { t } from '@ui-kit/lib/i18n'
import { IconStack } from '@ui-kit/shared/ui/IconStack'
import { RewardIcon } from '@ui-kit/shared/ui/RewardIcon'
import { TokenIcon } from '@ui-kit/shared/ui/TokenIcon'
import { Tooltip, type TooltipProps } from '@ui-kit/shared/ui/Tooltip'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import { formatNumber, MAINNET_CRV } from '@ui-kit/utils'
import type { PoolRow } from '../types'
import { GaugeApyRange } from './GaugeApyCell'
import {
  aprToPoolApy,
  getGaugeApyDescription,
  getGaugeApyRange,
  getExtraRewards,
  getAprCampaigns,
  getPointsCampaigns,
} from './utils'

const { Spacing } = SizesAndSpaces

type ExtraReward = PoolRow['extraRewardsApr'][number]

const ExtraRewardTooltipBody = ({ reward }: { reward: ExtraReward }) => (
  <Stack sx={{ gap: Spacing.xs, textAlign: 'start' }}>
    {(reward.symbol || reward.name) && <Typography variant="bodySRegular">{reward.symbol ?? reward.name}</Typography>}
    <Typography variant="bodySRegular">{t`APY from an extra reward for providing liquidity in this pool.`}</Typography>
    <Typography variant="bodySRegular">
      {t`APY`}: {formatNumber(aprToPoolApy(reward.apr), 'percent.rate')}
    </Typography>
  </Stack>
)

const CampaignTooltip = ({ campaign, showApy }: { campaign: CampaignRewards; showApy: boolean }) => (
  <Stack sx={{ gap: Spacing.sm }}>
    {showApy && campaign.reward?.type === 'apr' && (
      <Typography variant="bodySRegular" sx={{ textAlign: 'start' }}>
        {t`APY`}: {formatNumber(aprToPoolApy(campaign.reward.value) || null, 'percent.rate')}
      </Typography>
    )}
    <TooltipMessage rewardsPool={campaign} />
  </Stack>
)

const CampaignIcon = ({ campaign }: { campaign: CampaignRewards }) => (
  <RewardIcon src={campaign.platformImageId} alt={campaign.platform} size="sm" sx={{ borderRadius: '50%' }} />
)

type RewardIconTooltipProps = Pick<TooltipProps, 'body' | 'children' | 'clickable' | 'placement' | 'title'> & {
  testId: string
}

const RewardIconTooltip = ({
  body,
  children,
  clickable,
  placement = 'bottom-end',
  testId,
  title,
}: RewardIconTooltipProps) => (
  <Tooltip
    body={body}
    clickable={clickable}
    title={title}
    placement={placement}
    slotProps={{ tooltip: { sx: { maxWidth: '400px' } } }}
  >
    <Box component="span" data-testid={testId} sx={{ alignItems: 'center', display: 'inline-flex' }}>
      {children}
    </Box>
  </Tooltip>
)

const ExtraRewardIcon = ({
  placement,
  pool,
  reward,
}: {
  placement?: TooltipProps['placement']
  pool: PoolRow
  reward: ExtraReward
}) => (
  <RewardIconTooltip
    body={<ExtraRewardTooltipBody reward={reward} />}
    placement={placement}
    testId="pool-extra-reward-badge"
    title={t`Extra pool reward`}
  >
    <TokenIcon blockchainId={pool.network} address={reward.address} size="mui-sm" />
  </RewardIconTooltip>
)

const CampaignRewardIcon = ({
  campaign,
  placement,
}: {
  campaign: CampaignRewards
  placement?: TooltipProps['placement']
}) => (
  <RewardIconTooltip
    clickable
    placement={placement}
    testId="pool-campaign-reward-badge"
    title={<CampaignTooltip campaign={campaign} showApy />}
  >
    <CampaignIcon campaign={campaign} />
  </RewardIconTooltip>
)

const CrvRewardIcon = ({
  placement,
  range,
}: {
  placement?: TooltipProps['placement']
  range: NonNullable<ReturnType<typeof getGaugeApyRange>>
}) => (
  <RewardIconTooltip
    body={
      <Stack sx={{ gap: Spacing.xs, textAlign: 'start' }}>
        <Typography variant="bodySRegular">
          {t`APY`}: <GaugeApyRange {...range} />
        </Typography>
        <Typography variant="bodySRegular">{getGaugeApyDescription()}</Typography>
      </Stack>
    }
    placement={placement}
    testId="pool-crv-reward-badge"
    title={t`CRV gauge reward`}
  >
    <TokenIcon blockchainId={MAINNET_CRV.chain} address={MAINNET_CRV.address} size="mui-sm" />
  </RewardIconTooltip>
)

export const PointsRewardIcon = ({
  campaign,
  placement,
  showLabel = true,
  typographyVariant = 'tableCellMBold',
}: {
  campaign: CampaignRewards
  placement?: TooltipProps['placement']
  showLabel?: boolean
  typographyVariant?: TypographyProps['variant']
}) => (
  <RewardIconTooltip
    clickable
    placement={placement}
    testId="pool-points-badge"
    title={<CampaignTooltip campaign={campaign} showApy={false} />}
  >
    <Stack component="span" direction="row" sx={{ alignItems: 'center', gap: Spacing.xs }}>
      {showLabel && (
        <Typography variant={typographyVariant}>
          {campaign.reward?.type === 'points' ? formatNumber(campaign.reward.value, 'multiplier') : campaign.symbol}
        </Typography>
      )}
      <CampaignIcon campaign={campaign} />
    </Stack>
  </RewardIconTooltip>
)

export const RewardIcons = ({
  includeCrv = false,
  includePoints = false,
  pool,
  tooltipPlacement,
}: {
  includeCrv?: boolean
  includePoints?: boolean
  pool: PoolRow
  tooltipPlacement?: TooltipProps['placement']
}) => {
  const pointsCampaigns = includePoints ? getPointsCampaigns(pool) : []
  const extraRewards = getExtraRewards(pool)
  const campaigns = getAprCampaigns(pool)
  const gaugeApyRange = includeCrv && !pool.gauge?.isKilled ? getGaugeApyRange(pool) : null

  if (!pointsCampaigns.length && !extraRewards.length && !campaigns.length && !gaugeApyRange) return null

  return (
    <IconStack iconSize="sm">
      {pointsCampaigns.map((campaign, index) => (
        <PointsRewardIcon
          // eslint-disable-next-line @eslint-react/no-array-index-key -- Campaigns may describe distinct point rewards with the same platform metadata.
          key={`${campaign.platform}-${campaign.description}-${index}`}
          campaign={campaign}
          placement={tooltipPlacement}
          showLabel={false}
        />
      ))}
      {extraRewards.map((reward, index) => (
        <ExtraRewardIcon
          // eslint-disable-next-line @eslint-react/no-array-index-key -- API reward rows do not provide a stable unique id and duplicates must remain visible.
          key={`${reward.address}-${reward.symbol}-${index}`}
          placement={tooltipPlacement}
          pool={pool}
          reward={reward}
        />
      ))}
      {campaigns.map((campaign, index) => (
        <CampaignRewardIcon
          // eslint-disable-next-line @eslint-react/no-array-index-key -- Campaigns may describe distinct rewards with the same platform metadata.
          key={`${campaign.platform}-${campaign.description}-${index}`}
          campaign={campaign}
          placement={tooltipPlacement}
        />
      ))}
      {gaugeApyRange && <CrvRewardIcon placement={tooltipPlacement} range={gaugeApyRange} />}
    </IconStack>
  )
}
