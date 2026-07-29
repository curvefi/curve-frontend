import { BaseApyTooltipContent } from '@/dex/components/BaseApyTooltipContent'
import { ChipVolatileBaseApy } from '@/dex/components/ChipVolatileBaseApy'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import type { CellContext } from '@tanstack/react-table'
import { t } from '@ui-kit/lib/i18n'
import { Tooltip } from '@ui-kit/shared/ui/Tooltip'
import type { PoolRow } from '../types'
import { formatCellValue, getBaseApy, isVolatileApy } from './utils'

const BaseApyAmount = ({ apy }: { apy: ReturnType<typeof getBaseApy> }) => (
  <Typography component="span" variant="tableCellMBold">
    {formatCellValue(apy, 'percent.rate')}
  </Typography>
)

const BaseApyValue = ({ apy, weekly }: { apy: ReturnType<typeof getBaseApy>; weekly: boolean }) => (
  <Box
    data-testid={weekly ? 'pool-weekly-base-apy-value' : 'pool-base-apy-value'}
    sx={{ display: 'flex', justifyContent: 'end' }}
  >
    {isVolatileApy(apy) ? <ChipVolatileBaseApy /> : <BaseApyAmount apy={apy} />}
  </Box>
)

const BaseApyTableCell = ({ pool, weekly = false }: { pool: PoolRow; weekly?: boolean }) => {
  const apy = getBaseApy(pool, weekly ? 'weekly' : 'daily')

  if (apy == null || isVolatileApy(apy)) {
    return <BaseApyValue apy={apy} weekly={weekly} />
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
            dailyApy={getBaseApy(pool, 'daily')}
            weeklyApy={getBaseApy(pool, 'weekly')}
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
          <BaseApyAmount apy={apy} />
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
