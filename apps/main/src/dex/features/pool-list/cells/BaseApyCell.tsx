import { BaseApyTooltipContent } from '@/dex/components/BaseApyTooltipContent'
import { ChipVolatileBaseApy } from '@/dex/components/ChipVolatileBaseApy'
import { LARGE_APY } from '@/dex/constants'
import Box from '@mui/material/Box'
import Typography, { type TypographyProps } from '@mui/material/Typography'
import type { CellContext } from '@tanstack/react-table'
import { t } from '@ui-kit/lib/i18n'
import { Tooltip, type TooltipProps } from '@ui-kit/shared/ui/Tooltip'
import type { PoolRow } from '../types'
import { aprToPoolApy, formatCellValue } from './utils'

const BaseApyAmount = ({
  apr,
  typographyVariant,
}: {
  apr: PoolRow['baseDailyApr']
  typographyVariant: TypographyProps['variant']
}) => (
  <Typography component="span" variant={typographyVariant}>
    {formatCellValue(aprToPoolApy(apr), 'percent.rate')}
  </Typography>
)

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
          body={
            <BaseApyTooltipContent
              dailyApy={aprToPoolApy(pool.baseDailyApr)}
              weeklyApy={aprToPoolApy(pool.baseWeeklyApr)}
              weekly={weekly}
            />
          }
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
          data-testid={weekly ? undefined : 'pool-base-apy-tooltip-trigger'}
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
