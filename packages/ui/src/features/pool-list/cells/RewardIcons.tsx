import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import Typography, { type TypographyProps } from '@mui/material/Typography'
import { formatDate } from '@primitives/date.utils'
import { formatNumber } from '@primitives/number.utils'
import { IconStack } from '@ui/components/IconStack'
import { RewardIcon } from '@ui/components/RewardIcon'
import { TokenIcon } from '@ui/components/TokenIcon'
import { Tooltip, type TooltipProps } from '@ui/components/Tooltip'
import { TooltipDescription, TooltipFooter, TooltipValueLink, TooltipWrapper } from '@ui/components/TooltipComponents'
import type { CampaignRewards } from '@ui/features/campaigns/types'
import { SizesAndSpaces } from '@ui/features/themes/design/1_sizes_spaces'
import { t } from '@ui/lib/i18n'
import type { PoolClaimables, PoolRow, PoolTableMeta } from '../types'
import {
  formatCrvAprRange,
  getCompactPointsCampaigns,
  getCrvAprDescription,
  getCrvAprRange,
  getExtraRewards,
  getAprCampaigns,
} from './utils'

const { Spacing } = SizesAndSpaces

type ExtraReward = PoolRow['extraRewardsApr'][number]

const ExtraRewardTooltipBody = ({ reward }: { reward: ExtraReward }) => (
  <Stack sx={{ gap: Spacing.xs, textAlign: 'start' }}>
    {(reward.symbol || reward.name) && <Typography variant="bodySRegular">{reward.symbol ?? reward.name}</Typography>}
    <Typography variant="bodySRegular">{t`APR from an extra reward for providing liquidity in this pool.`}</Typography>
    <Typography variant="bodySRegular">
      {t`APR`}: {formatNumber(reward.apr, 'percent.rate')}
    </Typography>
  </Stack>
)

export const CampaignTooltipContent = ({ campaign, showRate }: { campaign: CampaignRewards; showRate: boolean }) => (
  <TooltipWrapper>
    {showRate && campaign.reward?.type === 'apr' && (
      <Typography variant="bodySRegular" sx={{ textAlign: 'start' }}>
        {t`APR`}: {formatNumber(campaign.reward.value, 'percent.rate')}
      </Typography>
    )}
    <Stack>
      <Typography variant="bodySBold">{campaign.campaignName || campaign.platform}</Typography>
      {campaign.campaignName && campaign.platform && <TooltipDescription text={t`by ${campaign.platform}`} />}
    </Stack>
    {campaign.period && (
      <Stack>
        <TooltipDescription text={t`from: ${formatDate(campaign.period[0])}`} />
        <TooltipDescription text={t`to: ${formatDate(campaign.period[1])}`} />
      </Stack>
    )}
    <TooltipDescription text={campaign.description} />
    {!!campaign.steps?.length && (
      <Stack>
        <Typography variant="bodySBold">{t`Steps:`}</Typography>
        <Box component="ol" sx={{ margin: 0, paddingInlineStart: '2ch' }}>
          {campaign.steps.map(step => (
            <Typography component="li" variant="bodySRegular" key={step} sx={{ listStyle: 'decimal' }}>
              {step}
            </Typography>
          ))}
        </Box>
      </Stack>
    )}
    <TooltipFooter>
      {t`External rewards are project dependent, always check with the token issuer to make sure you have taken all the necessary actions to benefit from their rewards program.`}
    </TooltipFooter>
    <TooltipValueLink href={campaign.dashboardLink}>{t`Go to issuer`}</TooltipValueLink>
  </TooltipWrapper>
)

const CampaignIcon = ({ campaign }: { campaign: CampaignRewards }) => (
  <RewardIcon src={campaign.platformImageId} alt={campaign.platform} size="sm" />
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
    <TokenIcon blockchainId={pool.blockchainId} address={reward.address} size="mui-sm" />
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
    title={<CampaignTooltipContent campaign={campaign} showRate />}
  >
    <CampaignIcon campaign={campaign} />
  </RewardIconTooltip>
)

const CrvRewardIcon = ({
  crvToken,
  placement,
  range,
}: {
  crvToken: PoolTableMeta['crvToken']
  placement?: TooltipProps['placement']
  range: NonNullable<ReturnType<typeof getCrvAprRange>>
}) => (
  <RewardIconTooltip
    body={
      <Stack sx={{ gap: Spacing.xs, textAlign: 'start' }}>
        <Typography variant="bodySRegular">
          {t`APR`}: {formatCrvAprRange(range)}
        </Typography>
        <Typography variant="bodySRegular">{getCrvAprDescription()}</Typography>
      </Stack>
    }
    placement={placement}
    testId="pool-crv-reward-badge"
    title={t`CRV gauge reward`}
  >
    <TokenIcon {...crvToken} size="mui-sm" />
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
    title={<CampaignTooltipContent campaign={campaign} showRate={false} />}
  >
    <Stack component="span" direction="row" sx={{ alignItems: 'center', gap: Spacing.xs }}>
      {showLabel && (
        <Typography variant={typographyVariant}>
          {campaign.reward?.type === 'points'
            ? formatNumber(campaign.reward.value, 'multiplier')
            : campaign.symbol || t`Points`}
        </Typography>
      )}
      <CampaignIcon campaign={campaign} />
    </Stack>
  </RewardIconTooltip>
)

export const RewardIcons = ({
  crvToken,
  includePoints = false,
  pool,
  tooltipPlacement,
}: {
  crvToken?: PoolTableMeta['crvToken']
  includePoints?: boolean
  pool: PoolRow
  tooltipPlacement?: TooltipProps['placement']
}) => {
  const pointsCampaigns = includePoints ? getCompactPointsCampaigns(pool) : []
  const extraRewards = getExtraRewards(pool)
  const campaigns = getAprCampaigns(pool)
  const crvRateRange = crvToken && !pool.gauge?.isKilled ? getCrvAprRange(pool) : null

  if (!pointsCampaigns.length && !extraRewards.length && !campaigns.length && !crvRateRange) return null

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
      {crvToken && crvRateRange && (
        <CrvRewardIcon crvToken={crvToken} placement={tooltipPlacement} range={crvRateRange} />
      )}
    </IconStack>
  )
}

export const ClaimablesIcons = ({
  claimables,
  blockchainId,
}: {
  claimables: PoolClaimables
  blockchainId: PoolRow['blockchainId']
}) => (
  <IconStack iconSize="sm">
    {claimables.map(reward => (
      <TokenIcon key={reward.token} blockchainId={blockchainId} address={reward.token} size="mui-sm" />
    ))}
  </IconStack>
)
