import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import Typography, { type TypographyProps } from '@mui/material/Typography'
import { t } from '@ui-kit/lib/i18n'
import { Tooltip, type TooltipProps } from '@ui-kit/shared/ui/Tooltip'
import { TooltipDescription, TooltipItem, TooltipItems, TooltipWrapper } from '@ui-kit/shared/ui/TooltipComponents'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import { formatNumber } from '@ui-kit/utils'
import type { PoolRow } from '../types'
import { CampaignRewardTooltipItems, ExtraRewardTooltipItems } from './ApyTooltipItems'
import { RewardIcons } from './RewardIcons'
import { getAprCampaigns, getCampaignRewardsApy, getExtraRewards, getExtraRewardsApy, getRewardsApy } from './utils'

const { Spacing } = SizesAndSpaces

const formatApy = (apy: number | null | undefined) => formatNumber(apy || null, 'percent.rate')

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

const RewardsApyAmount = ({
  pool,
  typographyVariant,
}: {
  pool: PoolRow
  typographyVariant: TypographyProps['variant']
}) => (
  <Typography component="span" variant={typographyVariant}>
    {formatApy(getRewardsApy(pool))}
  </Typography>
)

const RewardsApyTooltipContent = ({ pool }: { pool: PoolRow }) => (
  <TooltipWrapper>
    <TooltipDescription
      text={t`Annualized yield from extra token rewards and APR campaigns. Points are not included.`}
    />
    <Stack>
      <RewardsApyTooltipItems pool={pool} />
    </Stack>
  </TooltipWrapper>
)

export const RewardsApyValue = ({
  pool,
  textAlign = 'end',
  tooltipPlacement,
  typographyVariant = 'tableCellMBold',
}: {
  pool: PoolRow
  textAlign?: 'start' | 'end'
  tooltipPlacement?: TooltipProps['placement']
  typographyVariant?: TypographyProps['variant']
}) => {
  const alignment = textAlign === 'start' ? 'flex-start' : 'flex-end'

  return (
    <Stack data-testid="pool-rewards-apy" sx={{ alignItems: alignment, gap: Spacing.xs }}>
      <RewardsApyAmount pool={pool} typographyVariant={typographyVariant} />
      <RewardIcons pool={pool} tooltipPlacement={tooltipPlacement} />
    </Stack>
  )
}

export const RewardsApyCell = ({ pool }: { pool: PoolRow }) => {
  const rewardsApy = getRewardsApy(pool)

  return (
    <Stack data-testid="pool-rewards-apy" sx={{ alignItems: 'flex-end', gap: Spacing.xs }}>
      {rewardsApy ? (
        <Tooltip clickable title={t`Rewards APY`} body={<RewardsApyTooltipContent pool={pool} />} placement="top">
          <Box component="span" data-testid="pool-rewards-apy-tooltip-trigger" sx={{ display: 'inline-flex' }}>
            <RewardsApyAmount pool={pool} typographyVariant="tableCellMBold" />
          </Box>
        </Tooltip>
      ) : (
        <RewardsApyAmount pool={pool} typographyVariant="tableCellMBold" />
      )}
      <RewardIcons pool={pool} />
    </Stack>
  )
}
