import { getMaxPositionLeverage } from '@/llamalend/max-leverage.utils'
import type { LlamaMarketRow } from '@/llamalend/queries/market-list/llama-market-stats'
import Typography from '@mui/material/Typography'
import { formatNumber } from '@primitives/number.utils'
import { maybe } from '@primitives/objects.utils'
import type { CellContext } from '@tanstack/react-table'
import type { CurveTableFeatures } from '@ui/features/tables/data-table.utils'
import { t } from '@ui/lib/i18n'
import { PositionMetricCell } from './PositionMetricCell'

const leverageFormat = { abbreviate: false, maximumSignificantDigits: 3, unit: 'multiplier' } as const

export const UserLeverageCell = ({
  getValue,
  row,
}: CellContext<CurveTableFeatures, LlamaMarketRow, number | undefined>) => {
  const stats = row.original.positionQueries.stats
  const value = getValue()
  const maxLeverage = getMaxPositionLeverage(row.original)
  return (
    <PositionMetricCell
      error={stats.error}
      hasData={stats.data != null}
      value={maybe(value, amount => formatNumber(amount, leverageFormat))}
      valueTestId="user-position-leverage-value"
      support={
        maxLeverage != null && (
          <Typography variant="bodyXsRegular" color="textSecondary" data-testid="user-position-max-leverage">
            {t`Max`} {formatNumber(maxLeverage, leverageFormat)}
          </Typography>
        )
      }
    />
  )
}
