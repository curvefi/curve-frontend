import { formatSigned } from '@/llamalend/position-pnl.utils'
import type { LlamaMarketRow } from '@/llamalend/queries/market-list/llama-market-stats'
import { DebtPnlTooltipContent } from '@/llamalend/widgets/tooltips/DebtPnlTooltipContent'
import { getChangeColor } from '@evm-ui/features/activity-table/utils'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { formatNumber } from '@primitives/number.utils'
import { maybe } from '@primitives/objects.utils'
import type { CellContext } from '@tanstack/react-table'
import { Tooltip } from '@ui/components/Tooltip'
import { WithSkeleton } from '@ui/components/WithSkeleton'
import type { CurveTableFeatures } from '@ui/features/tables/data-table.utils'
import { SizesAndSpaces } from '@ui/features/themes/design/1_sizes_spaces'
import { t } from '@ui/lib/i18n'
import { getUserPnl } from '../user-position.utils'
import { ErrorCell } from './ErrorCell'

const { Spacing } = SizesAndSpaces

type PositionCellProps = CellContext<CurveTableFeatures, LlamaMarketRow, number | undefined>

// The skeleton is a block, so the cell's text alignment does not move it: the auto margin pushes it to the right
const skeletonProps = { width: 40, sx: { marginInlineStart: 'auto' } } as const

/** Equity of the borrow position in USD */
export const EquityCell = ({ getValue, row }: PositionCellProps) => {
  const { stats, prices } = row.original.positionQueries
  return stats.error ? (
    <ErrorCell error={stats.error} />
  ) : (
    <WithSkeleton loading={stats.isLoading || prices.borrowed.isLoading} {...skeletonProps}>
      <Typography variant="tableCellValue">{formatNumber(getValue(), 'usd.notional')}</Typography>
    </WithSkeleton>
  )
}

/** PNL of the borrow position in the collateral token, with the ROE below it and the debt-token PNL on hover */
export const PnlCell = ({ getValue, row }: PositionCellProps) => {
  const { positionQueries, assets } = row.original
  const { stats, capital } = positionQueries
  const error = stats.error ?? capital.error
  const pnl = getUserPnl(row.original)
  const roe = getValue()
  return error ? (
    <ErrorCell error={error} />
  ) : (
    <WithSkeleton loading={stats.isLoading || capital.isLoading} {...skeletonProps}>
      <Tooltip
        title={pnl && t`PNL (ROE %)`}
        body={maybe(pnl, ({ debt }) => (
          <DebtPnlTooltipContent pnl={debt} symbol={assets.borrowed.symbol} />
        ))}
      >
        <Stack sx={{ gap: Spacing.xs, alignItems: 'end' }}>
          <Typography variant="tableCellValueStrong">
            {maybe(
              pnl?.collateral?.pnl,
              value => `${formatSigned(value, 'token.amount')} ${assets.collateral.symbol}`,
            ) ?? '-'}
          </Typography>
          {roe != null && (
            <Typography variant="tableCellSupport" color={getChangeColor(roe, 'success', 'error')}>
              {formatSigned(roe, 'percent.value')}
            </Typography>
          )}
        </Stack>
      </Tooltip>
    </WithSkeleton>
  )
}
