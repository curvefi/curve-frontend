import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import Typography, { type TypographyProps } from '@mui/material/Typography'
import { t } from '@ui-kit/lib/i18n'
import { Tooltip, type TooltipProps } from '@ui-kit/shared/ui/Tooltip'
import { TooltipDescription, TooltipWrapper } from '@ui-kit/shared/ui/TooltipComponents'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import { formatNumber } from '@ui-kit/utils'
import type { PoolRow } from '../types'
import { RewardsApyTooltipItems } from './ApyTooltipItems'
import { RewardIcons } from './RewardIcons'
import { getRewardsApy } from './utils'

const { Spacing } = SizesAndSpaces

const formatApy = (apy: number | null | undefined) => formatNumber(apy || null, 'percent.rate')

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
  <Box data-testid="pool-rewards-apy-tooltip-content">
    <TooltipWrapper>
      <TooltipDescription
        text={t`Annualized yield from extra token rewards and APR campaigns. Points are not included.`}
      />
      <Stack>
        <RewardsApyTooltipItems pool={pool} />
      </Stack>
    </TooltipWrapper>
  </Box>
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
