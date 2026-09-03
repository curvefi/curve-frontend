import { BaseRateTooltipContent } from '@/dex/components/BaseRateTooltipContent'
import { ChipVolatileBaseApy } from '@/dex/components/ChipVolatileBaseApy'
import { t } from '@evm-ui/lib/i18n'
import type { CurveTableFeatures } from '@evm-ui/shared/ui/DataTable/data-table.utils'
import { Tooltip } from '@evm-ui/shared/ui/Tooltip'
import { WithWrapper } from '@evm-ui/shared/ui/WithWrapper'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import type { CellContext } from '@tanstack/react-table'
import type { PoolRow } from '../types'
import { formatCellValue, getBaseApy, isVolatileApy } from './utils'

const BaseRateTableCell = ({ pool, weekly = false }: { pool: PoolRow; weekly?: boolean }) => {
  const dailyApy = getBaseApy(pool, 'daily')
  const weeklyApy = getBaseApy(pool, 'weekly')
  const apy = weekly ? weeklyApy : dailyApy
  const volatile = isVolatileApy(apy)
  const hasTooltip = apy != null && !volatile

  return (
    <Box
      data-testid={weekly ? 'pool-weekly-base-apy-value' : 'pool-base-apy-value'}
      sx={{ display: 'flex', justifyContent: 'end' }}
    >
      <WithWrapper
        shouldWrap={hasTooltip}
        Wrapper={Tooltip}
        clickable
        title={weekly ? t`Weekly Base APY` : t`Base APY`}
        body={<BaseRateTooltipContent dailyApy={dailyApy} weeklyApy={weeklyApy} weekly={weekly} />}
        placement="top"
      >
        <Box
          component="span"
          data-testid={!weekly && hasTooltip ? 'pool-base-apy-tooltip-trigger' : undefined}
          sx={{ display: 'inline-flex' }}
        >
          {volatile ? (
            <ChipVolatileBaseApy />
          ) : (
            <Typography variant="tableCellMBold">{formatCellValue(apy, 'percent.rate')}</Typography>
          )}
        </Box>
      </WithWrapper>
    </Box>
  )
}

export const BaseRateCell = ({
  row: { original: pool },
}: CellContext<CurveTableFeatures, PoolRow, PoolRow['baseDailyApr']>) => <BaseRateTableCell pool={pool} />

export const WeeklyBaseRateCell = ({
  row: { original: pool },
}: CellContext<CurveTableFeatures, PoolRow, PoolRow['baseWeeklyApr']>) => <BaseRateTableCell pool={pool} weekly />
