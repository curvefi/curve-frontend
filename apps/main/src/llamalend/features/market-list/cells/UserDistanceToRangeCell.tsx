import { formatDistancePercent } from '@/llamalend/features/market-position-details/position-metrics.utils'
import type { LlamaMarketRow } from '@/llamalend/queries/market-list/llama-market-stats'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { formatNumber } from '@primitives/number.utils'
import type { CellContext } from '@tanstack/react-table'
import type { CurveTableFeatures } from '@ui/features/tables/data-table.utils'
import { SizesAndSpaces } from '@ui/features/themes/design/1_sizes_spaces'
import { t } from '@ui/lib/i18n'
import { getTokenPairUnit } from '@ui/lib/tokens'
import { getUserPositionPriceDistance } from '../user-position.utils'
import { ErrorCell } from './ErrorCell'

const { Spacing } = SizesAndSpaces

export const UserDistanceToRangeCell = ({
  row,
}: CellContext<CurveTableFeatures, LlamaMarketRow, number | undefined>) => {
  const { oracle, prices } = row.original.positionQueries.risk
  const distance = getUserPositionPriceDistance(row.original)
  const error = oracle.error ?? prices.error
  if (error && distance == undefined) return <ErrorCell error={error} />
  const range = prices.data
  const { collateral, borrowed } = row.original.assets
  const headline =
    distance?.location === 'inside'
      ? t`In range`
      : distance?.location === 'above' || distance?.location === 'below'
        ? formatDistancePercent(distance.percent)
        : distance?.location === 'unavailable'
          ? t`Unavailable`
          : ''
  return (
    <Stack sx={{ gap: Spacing.xs, alignItems: 'end' }} data-testid="user-position-distance">
      <Typography variant="tableCellMBold">{headline}</Typography>
      {range && (
        <Typography variant="bodyXsRegular" color="textSecondary">
          {`${formatNumber(range[1], { abbreviate: true })}–${formatNumber(range[0], { abbreviate: true })} ${getTokenPairUnit([collateral.symbol, borrowed.symbol])}`}
        </Typography>
      )}
    </Stack>
  )
}
