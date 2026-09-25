import { formatYieldMultiplier } from '@/llamalend/features/market-position-details/position-roe.utils'
import type { LlamaMarketRow } from '@/llamalend/queries/market-list/llama-market-stats'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { formatNumber } from '@primitives/number.utils'
import type { CellContext } from '@tanstack/react-table'
import type { CurveTableFeatures } from '@ui/features/tables/data-table.utils'
import { SizesAndSpaces } from '@ui/features/themes/design/1_sizes_spaces'
import { t } from '@ui/lib/i18n'
import { getUserPositionRoeResult } from '../user-position.utils'
import { ErrorCell } from './ErrorCell'

const { Spacing } = SizesAndSpaces

export const UserReturnOnEquityCell = ({
  row,
}: CellContext<CurveTableFeatures, LlamaMarketRow, number | undefined>) => {
  const stats = row.original.positionQueries.stats
  if (stats.error && stats.data == null) return <ErrorCell error={stats.error} />
  const roe = getUserPositionRoeResult(row.original)
  const multiplier = roe ? formatYieldMultiplier(roe.multiplier) : undefined
  const text = roe == undefined ? (stats.data ? t`Unavailable` : '') : formatNumber(roe.aprPercent, 'percent.rate')
  return (
    <Stack sx={{ gap: Spacing.xs, alignItems: 'end' }} data-testid="user-position-roe">
      <Typography variant="tableCellMBold">{text}</Typography>
      {multiplier && (
        <Typography variant="bodyXsRegular" color="textSecondary" data-testid="user-position-yield-multiplier">
          {multiplier}
        </Typography>
      )}
    </Stack>
  )
}
