import { formatHealthFactor } from '@/llamalend/features/market-position-details/market-position-details.utils'
import type { LlamaMarketRow } from '@/llamalend/queries/market-list/llama-market-stats'
import { CurrentLTVTooltipContent } from '@/llamalend/widgets/tooltips/CurrentLTVTooltipContent'
import { TokenPnlTooltipContent } from '@/llamalend/widgets/tooltips/TokenPnlTooltipContent'
import { getChangeColor } from '@evm-ui/features/activity-table/utils'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { formatNumber, UNAVAILABLE_NOTATION } from '@primitives/number.utils'
import { maybe } from '@primitives/objects.utils'
import type { CellContext } from '@tanstack/react-table'
import { Tooltip } from '@ui/components/Tooltip'
import type { CurveTableFeatures } from '@ui/features/tables/data-table.utils'
import { SizesAndSpaces } from '@ui/features/themes/design/1_sizes_spaces'
import { t } from '@ui/lib/i18n'
import { getUserLiquidationBufferAmount, getUserYieldMultiplier } from '../user-position.utils'

const { Spacing } = SizesAndSpaces

type BorrowPositionCellProps = CellContext<CurveTableFeatures, LlamaMarketRow, number | undefined>

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

/** Equity of the borrow position in USD */
export const EquityCell = ({ getValue }: BorrowPositionCellProps) => (
  <Typography variant="tableCellValue">{formatNumber(getValue(), 'usd.notional')}</Typography>
)

/** PNL of the borrow position in USD (debt-token PNL at its USD rate), with its ROI below it and the PNL per token on hover */
export const PnlCell = ({ row, getValue }: BorrowPositionCellProps) => {
  const { positionQueries, assets } = row.original
  const pnl = positionQueries.pnl.data
  const roi = maybe(pnl?.debt.roi, Number)
  return (
    <Tooltip
      title={pnl && t`PNL (ROI %)`}
      body={maybe(pnl, ({ collateral, debt }) => (
        <TokenPnlTooltipContent
          debt={{ pnl: debt, symbol: assets.borrowed.symbol }}
          collateral={maybe(collateral, pnl => ({ pnl, symbol: assets.collateral.symbol }))}
        />
      ))}
      placement="top"
    >
      <Stack sx={{ gap: Spacing.xs, alignItems: 'end' }}>
        <Typography variant="tableCellValueStrong">{formatNumber(getValue(), 'usd.delta')}</Typography>
        {maybe(roi, roi => (
          <Typography variant="tableCellSupport" color={getChangeColor(roi, 'success', 'error')}>
            {formatNumber(roi, 'percent.delta')}
          </Typography>
        ))}
      </Stack>
    </Tooltip>
  )
}

export const LtvCell = ({ getValue }: BorrowPositionCellProps) => {
  const ltv = getValue()
  return ltv ? (
    <Tooltip clickable title={t`LTV`} body={<CurrentLTVTooltipContent />} placement="top">
      <Typography variant="tableCellValue" color="textPrimary" sx={{ textAlign: 'right' }}>
        {formatNumber(ltv, 'percent.rate')}
      </Typography>
    </Tooltip>
  ) : (
    <Typography variant="tableCellValue" color="textSecondary" sx={{ textAlign: 'right' }}>
      -
    </Typography>
  )
}

export const HealthFactorCell = ({ getValue }: BorrowPositionCellProps) => (
  <PositionMetric value={formatHealthFactor(getValue())} />
)

export const LiquidationBufferCell = ({ row: { original: row }, getValue }: BorrowPositionCellProps) => (
  <PositionMetric
    value={formatNumber(getValue(), 'percent.value')}
    support={maybe(
      getUserLiquidationBufferAmount(row),
      amount => `${formatNumber(amount, 'token.compact')} ${row.assets.borrowed.symbol}`,
    )}
  />
)

export const LeverageCell = ({ getValue }: BorrowPositionCellProps) => (
  <PositionMetric value={formatNumber(getValue(), 'multiplier')} />
)

export const LoopedAprCell = ({ row: { original: row }, getValue }: BorrowPositionCellProps) => (
  <PositionMetric
    value={formatNumber(getValue(), 'percent.rate')}
    support={maybe(getUserYieldMultiplier(row), multiplier => `${formatNumber(multiplier, 'multiplier')} ${t`yield`}`)}
  />
)

export const BandCountCell = ({ getValue }: BorrowPositionCellProps) => (
  <PositionMetric value={formatNumber(getValue(), { abbreviate: false, fallback: UNAVAILABLE_NOTATION })} />
)

export const CollateralCompositionCell = ({ row: { original: row }, getValue }: BorrowPositionCellProps) => (
  <PositionMetric
    value={
      maybe(getValue(), share => `${formatNumber(share, 'percent.rate')} ${row.assets.collateral.symbol}`) ??
      UNAVAILABLE_NOTATION
    }
    support={maybe(getValue(), share => `${formatNumber(100 - share, 'percent.rate')} ${row.assets.borrowed.symbol}`)}
  />
)
