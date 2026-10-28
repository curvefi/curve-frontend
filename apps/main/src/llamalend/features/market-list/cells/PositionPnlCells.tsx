import type { LlamaMarketRow } from '@/llamalend/queries/market-list/llama-market-stats'
import { getChangeColor } from '@evm-ui/features/activity-table/utils'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { formatNumber } from '@primitives/number.utils'
import type { CellContext } from '@tanstack/react-table'
import { WithSkeleton } from '@ui/components/WithSkeleton'
import type { CurveTableFeatures } from '@ui/features/tables/data-table.utils'
import { SizesAndSpaces } from '@ui/features/themes/design/1_sizes_spaces'
import { getUserPnlRoe } from '../user-position.utils'
import { ErrorCell } from './ErrorCell'

const { Spacing } = SizesAndSpaces

type PositionCellProps = CellContext<CurveTableFeatures, LlamaMarketRow, number | undefined>

/** Same size as the LtvCell skeleton, right aligned in the numeric column */
const skeletonProps = { variant: 'text', width: 40, sx: { marginInlineStart: 'auto' } } as const

/** Equity of the borrow position in USD */
export const EquityCell = ({ getValue, row }: PositionCellProps) => {
  const { stats, prices } = row.original.positionQueries
  return stats.error ? (
    <ErrorCell error={stats.error} />
  ) : (
    <WithSkeleton loading={stats.isLoading || prices.borrowed.isLoading} {...skeletonProps}>
      <Typography variant="tableCellValue" color="textPrimary">
        {formatNumber(getValue(), 'usd.notional')}
      </Typography>
    </WithSkeleton>
  )
}

/** PNL of the borrow position in USD, with the ROE below it */
export const PnlCell = ({ getValue, row }: PositionCellProps) => {
  const { stats, prices, cashFlows } = row.original.positionQueries
  const error = stats.error ?? cashFlows.error
  const pnlUsd = getValue()
  const roe = getUserPnlRoe(row.original)
  return error ? (
    <ErrorCell error={error} />
  ) : (
    <WithSkeleton loading={stats.isLoading || cashFlows.isLoading || prices.collateral.isLoading} {...skeletonProps}>
      <Stack sx={{ gap: Spacing.xs, alignItems: 'end' }}>
        <Typography variant="tableCellValueStrong" color={getChangeColor(pnlUsd ?? 0, 'success', 'error')}>
          {formatNumber(pnlUsd, 'usd.notional')}
        </Typography>
        {roe != null && (
          <Typography variant="tableCellSupport" color={getChangeColor(roe, 'success', 'error')}>
            {formatNumber(roe, 'percent.value')}
          </Typography>
        )}
      </Stack>
    </WithSkeleton>
  )
}
