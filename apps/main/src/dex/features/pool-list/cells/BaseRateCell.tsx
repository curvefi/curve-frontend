import { BaseRateTooltipContent } from '@/dex/components/BaseRateTooltipContent'
import { ChipVolatileBaseApy } from '@/dex/components/ChipVolatileBaseApy'
import type { CurveTableFeatures } from '@evm-ui/shared/ui/DataTable/data-table.utils'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import type { CellContext } from '@tanstack/react-table'
import { Tooltip } from '@ui/components/Tooltip'
import { WithWrapper } from '@ui/components/WithWrapper'
import { t } from '@ui/lib/i18n'
import type { PoolRow } from '../types'
import { formatCellValue, getBaseApr, isVolatileRate } from './utils'

const BaseRateTableCell = ({ pool, weekly = false }: { pool: PoolRow; weekly?: boolean }) => {
  const dailyRate = getBaseApr(pool, 'daily')
  const weeklyRate = getBaseApr(pool, 'weekly')
  const rate = weekly ? weeklyRate : dailyRate
  const volatile = isVolatileRate(rate)
  const hasTooltip = rate != null && !volatile

  return (
    <Box sx={{ display: 'flex', justifyContent: 'end' }}>
      <WithWrapper
        shouldWrap={hasTooltip}
        Wrapper={Tooltip}
        clickable
        title={weekly ? t`Weekly Base APR` : t`Base APR`}
        body={<BaseRateTooltipContent dailyRate={dailyRate} weeklyRate={weeklyRate} weekly={weekly} />}
        placement="top"
      >
        <Box component="span" sx={{ display: 'inline-flex' }}>
          {volatile ? (
            <ChipVolatileBaseApy />
          ) : (
            <Typography variant="tableCellMBold">{formatCellValue(rate, 'percent.rate')}</Typography>
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
