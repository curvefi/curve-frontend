import type { LlamaMarketRow } from '@/llamalend/queries/market-list/llama-market-stats'
import Typography from '@mui/material/Typography'
import { formatNumber } from '@primitives/number.utils'
import type { CellContext } from '@tanstack/react-table'
import type { CurveTableFeatures } from '@ui/features/tables/data-table.utils'
import { t } from '@ui/lib/i18n'
import { ErrorCell } from './ErrorCell'

export const UserLeverageCell = ({
  getValue,
  row,
}: CellContext<CurveTableFeatures, LlamaMarketRow, number | undefined>) => {
  const stats = row.original.positionQueries.stats
  if (stats.error && stats.data == null) return <ErrorCell error={stats.error} />
  const value = getValue()
  return (
    <Typography variant="tableCellMBold" data-testid="user-position-leverage-value">
      {value == undefined
        ? stats.data
          ? t`Unavailable`
          : ''
        : formatNumber(value, { abbreviate: false, maximumSignificantDigits: 3, unit: 'multiplier' })}
    </Typography>
  )
}
