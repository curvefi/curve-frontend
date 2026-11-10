import { formatHealth, getHealthTextColor, getLiquidationBufferTextColor } from '@/llamalend/health.utils'
import type { LlamaMarketRow } from '@/llamalend/queries/market-list/llama-market-stats'
import { POSITION_STATUS_BADGE } from '@/llamalend/features/market-position-details/health/HealthDetails'
import { HealthTooltipContent } from '@/llamalend/features/market-position-details/tooltips/HealthTooltipContent'
import { CurrentLTVTooltipContent } from '@/llamalend/widgets/tooltips/CurrentLTVTooltipContent'
import { OpeningLeverageTooltipContent } from '@/llamalend/widgets/tooltips/LeverageTooltipContent'
import { TokenPnlTooltipContent } from '@/llamalend/widgets/tooltips/TokenPnlTooltipContent'
import { getChangeColor } from '@evm-ui/features/activity-table/utils'
import Stack from '@mui/material/Stack'
import { useTheme } from '@mui/material/styles'
import Typography from '@mui/material/Typography'
import { formatNumber, UNAVAILABLE_NOTATION } from '@primitives/number.utils'
import { maybe, maybes } from '@primitives/objects.utils'
import type { CellContext } from '@tanstack/react-table'
import { Badge } from '@ui/components/Badge'
import { Tooltip } from '@ui/components/Tooltip'
import type { CurveTableFeatures } from '@ui/features/tables/data-table.utils'
import { SizesAndSpaces } from '@ui/features/themes/design/1_sizes_spaces'
import { t } from '@ui/lib/i18n'
import { formatToken } from '@ui/lib/tokens'
import { getUserYieldMultiplier } from '../user-position.utils'

const { Spacing } = SizesAndSpaces

type BorrowPositionCellProps = CellContext<CurveTableFeatures, LlamaMarketRow, number | undefined>

/** A metric of the borrow position, with an optional colour and support line below it */
const PositionMetric = ({ value, color, support }: { value: string; color?: string; support?: string }) => (
  <Stack sx={{ gap: Spacing.xs, alignItems: 'end' }}>
    <Typography variant="tableCellValueStrong" color={color}>
      {value}
    </Typography>
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

export const LtvCell = ({ getValue }: BorrowPositionCellProps) => (
  <Tooltip clickable title={t`LTV`} body={<CurrentLTVTooltipContent />} placement="top">
    <Typography variant="tableCellValue" color="textPrimary" sx={{ textAlign: 'right' }}>
      {formatNumber(getValue(), 'percent.rate')}
    </Typography>
  </Tooltip>
)

/** Health of the borrow position, with its status below it */
export const HealthCell = ({ row: { original: row } }: BorrowPositionCellProps) => {
  const theme = useTheme()
  const { positionHealth, healthThresholds } = row.positionQueries.stats.data ?? {}
  return (
    maybes([positionHealth, healthThresholds], (positionHealth, thresholds) => (
      <Tooltip title={t`Health`} body={<HealthTooltipContent status={positionHealth.status} />} placement="top">
        <Stack sx={{ gap: Spacing.xs, alignItems: 'end' }}>
          <Typography variant="tableCellValueStrong" color={getHealthTextColor(positionHealth, thresholds, theme)}>
            {formatHealth(positionHealth.health)}
          </Typography>
          <Badge size="extraSmall" {...POSITION_STATUS_BADGE[positionHealth.status]} />
        </Stack>
      </Tooltip>
    )) ?? <PositionMetric value={UNAVAILABLE_NOTATION} />
  )
}

/** Liquidation buffer of the borrow position in % of debt, with the buffer in the borrowed token below it */
export const LiquidationBufferCell = ({ row: { original: row }, getValue }: BorrowPositionCellProps) => {
  const theme = useTheme()
  const { positionHealth, healthThresholds } = row.positionQueries.stats.data ?? {}
  return (
    <PositionMetric
      value={formatNumber(getValue(), 'percent.value')}
      color={maybes([positionHealth, healthThresholds], (positionHealth, thresholds) =>
        getLiquidationBufferTextColor(positionHealth, thresholds, theme),
      )}
      support={maybe(positionHealth, ({ liquidationBufferAmount }) =>
        formatToken(liquidationBufferAmount, row.assets.borrowed.symbol),
      )}
    />
  )
}

/** How far the oracle price is from the liquidation range, with the range prices below it */
export const DistanceToRangeCell = ({ row: { original: row }, getValue }: BorrowPositionCellProps) => (
  <PositionMetric
    value={getValue() === 0 ? t`In range` : formatNumber(getValue(), 'percent.delta')}
    support={maybe(row.positionQueries.stats.data?.rangePrices, prices =>
      prices.map(price => formatNumber(price, { abbreviate: false })).join(' – '),
    )}
  />
)

/** Leverage of the borrow position, with the leverage it opened at on hover */
export const LeverageCell = ({ row, getValue }: BorrowPositionCellProps) => (
  <Tooltip
    title={t`Opened at`}
    body={<OpeningLeverageTooltipContent openingLeverage={row.original.positionQueries.openingLeverage} />}
    placement="top"
  >
    <Stack>
      <PositionMetric value={formatNumber(getValue(), 'multiplier')} />
    </Stack>
  </Tooltip>
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
    value={formatToken(getValue(), row.assets.collateral.symbol, 'share')}
    support={maybe(getValue(), share => formatToken(100 - share, row.assets.borrowed.symbol, 'share'))}
  />
)
