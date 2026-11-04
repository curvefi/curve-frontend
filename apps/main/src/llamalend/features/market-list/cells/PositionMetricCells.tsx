import { formatHealthFactor } from '@/llamalend/features/market-position-details/market-position-details.utils'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { formatNumber, UNAVAILABLE_NOTATION } from '@primitives/number.utils'
import { maybe } from '@primitives/objects.utils'
import { SizesAndSpaces } from '@ui/features/themes/design/1_sizes_spaces'
import { t } from '@ui/lib/i18n'
import { getUserLiquidationBufferAmount, getUserYieldMultiplier } from '../user-position.utils'
import type { PositionCellProps } from './cell.constants'

const { Spacing } = SizesAndSpaces

/** A metric of the borrow position, with an optional support line below it */
const PositionMetric = ({ value, support }: { value: string; support?: string }) => (
  <Stack sx={{ gap: Spacing.xs, alignItems: 'end' }}>
    <Typography variant="tableCellValueStrong">{value}</Typography>
    {support && (
      <Typography variant="tableCellSupport" color="textSecondary">
        {support}
      </Typography>
    )}
  </Stack>
)

export const HealthFactorCell = ({ getValue }: PositionCellProps) => (
  <PositionMetric value={formatHealthFactor(getValue())} />
)

export const LiquidationBufferCell = ({ row: { original: row }, getValue }: PositionCellProps) => (
  <PositionMetric
    value={formatNumber(getValue(), 'percent.value')}
    support={maybe(
      getUserLiquidationBufferAmount(row),
      amount => `${formatNumber(amount, 'token.compact')} ${row.assets.borrowed.symbol}`,
    )}
  />
)

export const LeverageCell = ({ getValue }: PositionCellProps) => (
  <PositionMetric value={formatNumber(getValue(), 'multiplier')} />
)

export const LoopedAprCell = ({ row: { original: row }, getValue }: PositionCellProps) => (
  <PositionMetric
    value={formatNumber(getValue(), 'percent.rate')}
    support={maybe(getUserYieldMultiplier(row), multiplier => `${formatNumber(multiplier, 'multiplier')} ${t`yield`}`)}
  />
)

export const BandCountCell = ({ getValue }: PositionCellProps) => (
  <PositionMetric value={formatNumber(getValue(), { abbreviate: false, fallback: UNAVAILABLE_NOTATION })} />
)

export const CollateralCompositionCell = ({ row: { original: row }, getValue }: PositionCellProps) => (
  <PositionMetric
    value={
      maybe(getValue(), share => `${formatNumber(share, 'percent.rate')} ${row.assets.collateral.symbol}`) ??
      UNAVAILABLE_NOTATION
    }
    support={maybe(getValue(), share => `${formatNumber(100 - share, 'percent.rate')} ${row.assets.borrowed.symbol}`)}
  />
)
