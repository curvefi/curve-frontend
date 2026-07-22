import { BaseApyTooltipContent } from '@/dex/components/BaseApyTooltipContent'
import { ChipVolatileBaseApy } from '@/dex/components/ChipVolatileBaseApy'
import { LARGE_APY } from '@/dex/constants'
import Box from '@mui/material/Box'
import Typography, { type TypographyProps } from '@mui/material/Typography'
import type { CellContext } from '@tanstack/react-table'
import { t } from '@ui-kit/lib/i18n'
import { Tooltip, type TooltipProps } from '@ui-kit/shared/ui/Tooltip'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import { formatNumber } from '@ui-kit/utils'
import type { PoolRow } from '../types'
import { aprToPoolApy } from './utils'

const { Spacing } = SizesAndSpaces

const BaseApyAmount = ({
  apr,
  typographyVariant,
}: {
  apr: PoolRow['baseDailyApr']
  typographyVariant: TypographyProps['variant']
}) => (
  <Typography component="span" variant={typographyVariant}>
    {formatNumber(aprToPoolApy(apr), 'percent.rate')}
  </Typography>
)

const BaseApyTooltipBody = ({ baseDailyApr, baseWeeklyApr }: Pick<PoolRow, 'baseDailyApr' | 'baseWeeklyApr'>) => {
  const baseDailyApy = aprToPoolApy(baseDailyApr)
  const baseWeeklyApy = aprToPoolApy(baseWeeklyApr)
  const hasNegativeApy = [baseDailyApy, baseWeeklyApy].some(apy => apy != null && apy < 0)

  return (
    <Box>
      <Typography variant="bodyXsRegular" color="textTertiary" sx={{ marginBottom: Spacing.xs }}>
        {t`(annualized)`}
      </Typography>
      <Box component="ul" sx={{ margin: 0, paddingInlineStart: Spacing.md }}>
        <Typography component="li" variant="bodySRegular">
          {t`Daily`}: {formatNumber(baseDailyApy === 0 ? null : baseDailyApy, 'percent.value')}
        </Typography>
        <Typography component="li" variant="bodySRegular">
          {t`Weekly`}: {formatNumber(baseWeeklyApy === 0 ? null : baseWeeklyApy, 'percent.value')}
        </Typography>
      </Box>

      {hasNegativeApy && (
        <Typography variant="bodySRegular" color="warning" sx={{ marginTop: Spacing.sm }}>
          {t`Base APY can temporarily be negative when A parameter is ramped down, or crypto pools spend profit to rebalance.`}
        </Typography>
      )}
    </Box>
  )
}

type BaseApyValueProps = {
  pool: PoolRow
  textAlign?: 'start' | 'end'
  tooltipPlacement?: TooltipProps['placement']
  typographyVariant?: TypographyProps['variant']
  weekly?: boolean
}

export const BaseApyValue = ({
  pool,
  weekly = false,
  textAlign = 'end',
  tooltipPlacement,
  typographyVariant = 'tableCellMBold',
}: BaseApyValueProps) => {
  const apr = weekly ? pool.baseWeeklyApr : pool.baseDailyApr
  const apy = aprToPoolApy(apr)
  const content = <BaseApyAmount apr={apr} typographyVariant={typographyVariant} />

  return (
    <Box
      data-testid={weekly ? 'pool-weekly-base-apy-value' : 'pool-base-apy-value'}
      sx={{ display: 'flex', justifyContent: textAlign }}
    >
      {apy != null && apy > LARGE_APY ? (
        <ChipVolatileBaseApy />
      ) : apr == null ? (
        content
      ) : (
        <Tooltip
          title={weekly ? t`Weekly Base APY` : t`Base APY`}
          body={<BaseApyTooltipBody baseDailyApr={pool.baseDailyApr} baseWeeklyApr={pool.baseWeeklyApr} />}
          placement={tooltipPlacement}
        >
          {content}
        </Tooltip>
      )}
    </Box>
  )
}

export const WeeklyBaseApyValue = (props: Omit<BaseApyValueProps, 'weekly'>) => <BaseApyValue {...props} weekly />

const BaseApyTableCell = ({ pool, weekly = false }: { pool: PoolRow; weekly?: boolean }) => {
  const apr = weekly ? pool.baseWeeklyApr : pool.baseDailyApr
  const apy = aprToPoolApy(apr)

  if (apr == null || (apy != null && apy > LARGE_APY)) {
    return <BaseApyValue pool={pool} weekly={weekly} />
  }

  return (
    <Box
      data-testid={weekly ? 'pool-weekly-base-apy-value' : 'pool-base-apy-value'}
      sx={{ display: 'flex', justifyContent: 'end' }}
    >
      <Tooltip
        clickable
        title={weekly ? t`Weekly Base APY` : t`Base APY`}
        body={
          <BaseApyTooltipContent
            dailyApy={aprToPoolApy(pool.baseDailyApr)}
            weeklyApy={aprToPoolApy(pool.baseWeeklyApr)}
            weekly={weekly}
          />
        }
        placement="top"
      >
        <Box
          component="span"
          data-testid={weekly ? 'pool-weekly-base-apy-tooltip-trigger' : 'pool-base-apy-tooltip-trigger'}
          sx={{ display: 'inline-flex' }}
        >
          <BaseApyAmount apr={apr} typographyVariant="tableCellMBold" />
        </Box>
      </Tooltip>
    </Box>
  )
}

export const BaseApyCell = ({ row: { original: pool } }: CellContext<PoolRow, PoolRow['baseDailyApr']>) => (
  <BaseApyTableCell pool={pool} />
)

export const WeeklyBaseApyCell = ({ row: { original: pool } }: CellContext<PoolRow, PoolRow['baseWeeklyApr']>) => (
  <BaseApyTableCell pool={pool} weekly />
)
