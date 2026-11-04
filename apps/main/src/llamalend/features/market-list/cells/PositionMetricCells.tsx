import { formatHealthFactor } from '@/llamalend/features/market-position-details/market-position-details.utils'
import type { LlamaMarketRow } from '@/llamalend/queries/market-list/llama-market-stats'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { formatNumber, UNAVAILABLE_NOTATION } from '@primitives/number.utils'
import { maybe } from '@primitives/objects.utils'
import { WithSkeleton } from '@ui/components/WithSkeleton'
import { combineQueryState } from '@ui/features/queries/combine'
import type { QueryProp } from '@ui/features/queries/util'
import { SizesAndSpaces } from '@ui/features/themes/design/1_sizes_spaces'
import { t } from '@ui/lib/i18n'
import { getUserLiquidationBufferAmount, getUserYieldMultiplier } from '../user-position.utils'
import { type PositionCellProps, skeletonProps } from './cell.constants'
import { ErrorCell } from './ErrorCell'

const { Spacing } = SizesAndSpaces

/** A metric of the borrow position stats, with an optional support line below it, and the query it also depends on */
const StatsMetric = ({
  row,
  value,
  support,
  dependsOn,
}: {
  row: LlamaMarketRow
  value: string
  support?: string
  dependsOn?: QueryProp<unknown>
}) => {
  const { stats } = row.positionQueries
  const { isLoading, error } = combineQueryState(stats, dependsOn)
  return error && (stats.data == null || (dependsOn && dependsOn.data == null)) ? (
    <ErrorCell error={error} />
  ) : (
    <WithSkeleton loading={isLoading} {...skeletonProps}>
      <Stack sx={{ gap: Spacing.xs, alignItems: 'end' }}>
        <Typography variant="tableCellValueStrong">{value}</Typography>
        {support && (
          <Typography variant="tableCellSupport" color="textSecondary">
            {support}
          </Typography>
        )}
      </Stack>
    </WithSkeleton>
  )
}

export const HealthFactorCell = ({ row: { original: row }, getValue }: PositionCellProps) => (
  <StatsMetric row={row} value={formatHealthFactor(getValue())} />
)

export const LiquidationBufferCell = ({ row: { original: row }, getValue }: PositionCellProps) => (
  <StatsMetric
    row={row}
    value={formatNumber(getValue(), 'percent.value')}
    support={maybe(
      getUserLiquidationBufferAmount(row),
      amount => `${formatNumber(amount, 'token.compact')} ${row.assets.borrowed.symbol}`,
    )}
  />
)

export const LeverageCell = ({ row: { original: row }, getValue }: PositionCellProps) => (
  <StatsMetric
    row={row}
    value={formatNumber(getValue(), 'multiplier')}
    dependsOn={row.positionQueries.isZapLeveraged}
  />
)

export const LoopedAprCell = ({ row: { original: row }, getValue }: PositionCellProps) => (
  <StatsMetric
    row={row}
    value={formatNumber(getValue(), 'percent.rate')}
    dependsOn={row.positionQueries.isZapLeveraged}
    support={maybe(getUserYieldMultiplier(row), multiplier => `${formatNumber(multiplier, 'multiplier')} ${t`yield`}`)}
  />
)

export const BandCountCell = ({ row: { original: row }, getValue }: PositionCellProps) => (
  <StatsMetric row={row} value={formatNumber(getValue(), { abbreviate: false, fallback: UNAVAILABLE_NOTATION })} />
)

export const CollateralCompositionCell = ({ row: { original: row }, getValue }: PositionCellProps) => (
  <StatsMetric
    row={row}
    value={
      maybe(getValue(), share => `${formatNumber(share, 'percent.rate')} ${row.assets.collateral.symbol}`) ??
      UNAVAILABLE_NOTATION
    }
    support={maybe(getValue(), share => `${formatNumber(100 - share, 'percent.rate')} ${row.assets.borrowed.symbol}`)}
  />
)
