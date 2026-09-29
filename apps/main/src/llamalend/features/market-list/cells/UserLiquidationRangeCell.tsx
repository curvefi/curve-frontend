import type { LlamaMarketRow } from '@/llamalend/queries/market-list/llama-market-stats'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { formatNumber } from '@primitives/number.utils'
import type { CellContext } from '@tanstack/react-table'
import type { CurveTableFeatures } from '@ui/features/tables/data-table.utils'
import { SizesAndSpaces } from '@ui/features/themes/design/1_sizes_spaces'
import { t } from '@ui/lib/i18n'
import { getTokenPairUnit } from '@ui/lib/tokens'
import { ErrorCell } from './ErrorCell'

const { Spacing } = SizesAndSpaces

export const UserLiquidationRangeCell = ({
  row,
}: CellContext<CurveTableFeatures, LlamaMarketRow, number | undefined>) => {
  const { data: prices, error, isLoading } = row.original.positionQueries.risk.prices
  if (error && !prices) return <ErrorCell error={error} />
  const { collateral, borrowed } = row.original.assets
  return (
    <Stack sx={{ gap: Spacing.xs, alignItems: 'end' }} data-testid="user-position-liquidation-range">
      <Typography variant="tableCellMBold">
        {prices
          ? `${formatNumber(prices[1], { abbreviate: true })}–${formatNumber(prices[0], { abbreviate: true })}`
          : isLoading
            ? ''
            : t`Unavailable`}
      </Typography>
      {prices && (
        <Typography variant="bodyXsRegular" color="textSecondary">
          {getTokenPairUnit([collateral.symbol, borrowed.symbol])}
        </Typography>
      )}
    </Stack>
  )
}
