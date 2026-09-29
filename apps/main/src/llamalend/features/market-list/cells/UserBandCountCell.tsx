import type { LlamaMarketRow } from '@/llamalend/queries/market-list/llama-market-stats'
import Typography from '@mui/material/Typography'
import { formatNumber } from '@primitives/number.utils'
import type { CellContext } from '@tanstack/react-table'
import type { CurveTableFeatures } from '@ui/features/tables/data-table.utils'
import { t } from '@ui/lib/i18n'
import { ErrorCell } from './ErrorCell'

export const UserBandCountCell = ({
  getValue,
  row,
}: CellContext<CurveTableFeatures, LlamaMarketRow, number | undefined>) => {
  const stats = row.original.positionQueries.stats
  if (stats.error && stats.data == null) return <ErrorCell error={stats.error} />
  const count = getValue()
  return (
    <Typography variant="tableCellMBold" data-testid="user-position-bands" sx={{ textAlign: 'right' }}>
      {count == undefined ? (stats.data ? t`Unavailable` : '') : formatNumber(count, { abbreviate: false })}
    </Typography>
  )
}
