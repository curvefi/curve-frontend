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
import { formatCellValue, getBaseApr, isVolatileRate } from './utils'

const BaseRateTableCell = ({ pool, weekly = false }: { pool: PoolRow; weekly?: boolean }) => {
  const dailyApr = getBaseApr(pool, 'daily')
  const weeklyApr = getBaseApr(pool, 'weekly')
  const apr = weekly ? weeklyApr : dailyApr
  const volatile = isVolatileRate(apr)
  const hasTooltip = apr != null && !volatile

  return (
    <Box sx={{ display: 'flex', justifyContent: 'end' }}>
      <WithWrapper
        shouldWrap={hasTooltip}
        Wrapper={Tooltip}
        clickable
        title={weekly ? t`Weekly Base APR` : t`Base APR`}
        body={<BaseRateTooltipContent dailyApy={dailyApr} weeklyApy={weeklyApr} weekly={weekly} />}
        placement="top"
      >
        <Box component="span" sx={{ display: 'inline-flex' }}>
          {volatile ? (
            <ChipVolatileBaseApy />
          ) : (
            <Typography variant="tableCellMBold">{formatCellValue(apr, 'percent.rate')}</Typography>
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
