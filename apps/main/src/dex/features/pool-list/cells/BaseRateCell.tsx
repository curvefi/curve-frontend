import { BaseRateTooltipContent } from '@/dex/components/BaseRateTooltipContent'
import { ChipVolatileBaseApy as ChipVolatileBaseRate } from '@/dex/components/ChipVolatileBaseApy'
import { useAprToApy, useRateDisplay } from '@evm-ui/hooks/useAprToApy'
import { t } from '@evm-ui/lib/i18n'
import type { CurveTableFeatures } from '@evm-ui/shared/ui/DataTable/data-table.utils'
import { Tooltip } from '@evm-ui/shared/ui/Tooltip'
import { WithWrapper } from '@evm-ui/shared/ui/WithWrapper'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import type { CellContext } from '@tanstack/react-table'
import type { PoolRow } from '../types'
import { formatCellValue, getBaseRate, isVolatileRate } from './utils'

const BaseRateTableCell = ({ pool, weekly = false }: { pool: PoolRow; weekly?: boolean }) => {
  const convertAprToApy = useAprToApy()
  const rateDisplay = useRateDisplay()
  const dailyRate = getBaseRate(pool, 'daily', convertAprToApy)
  const weeklyRate = getBaseRate(pool, 'weekly', convertAprToApy)
  const rate = weekly ? weeklyRate : dailyRate
  const volatile = isVolatileRate(rate)
  const hasTooltip = rate != null && !volatile
  const title = weekly
    ? rateDisplay === 'apy'
      ? t`Weekly Base APY`
      : t`Weekly Base APR`
    : rateDisplay === 'apy'
      ? t`Base APY`
      : t`Base APR`

  return (
    <Box
      data-testid={weekly ? 'pool-weekly-base-rate-value' : 'pool-base-rate-value'}
      sx={{ display: 'flex', justifyContent: 'end' }}
    >
      <WithWrapper
        shouldWrap={hasTooltip}
        Wrapper={Tooltip}
        clickable
        title={title}
        body={<BaseRateTooltipContent dailyRate={dailyRate} weeklyRate={weeklyRate} weekly={weekly} />}
        placement="top"
      >
        <Box
          component="span"
          data-testid={!weekly && hasTooltip ? 'pool-base-rate-tooltip-trigger' : undefined}
          sx={{ display: 'inline-flex' }}
        >
          {volatile ? (
            <ChipVolatileBaseRate />
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
}: CellContext<CurveTableFeatures, PoolRow, number>) => <BaseRateTableCell pool={pool} />

export const WeeklyBaseRateCell = ({
  row: { original: pool },
}: CellContext<CurveTableFeatures, PoolRow, number>) => <BaseRateTableCell pool={pool} weekly />
