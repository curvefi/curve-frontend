import { formatSigned } from '@/llamalend/position-pnl.utils'
import type { LlamaMarketRow } from '@/llamalend/queries/market-list/llama-market-stats'
import { DebtPnlTooltipContent } from '@/llamalend/widgets/tooltips/DebtPnlTooltipContent'
import { getChangeColor } from '@evm-ui/features/activity-table/utils'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { formatNumber, UNAVAILABLE_NOTATION } from '@primitives/number.utils'
import { maybe } from '@primitives/objects.utils'
import type { CellContext } from '@tanstack/react-table'
import { Tooltip } from '@ui/components/Tooltip'
import { WithSkeleton } from '@ui/components/WithSkeleton'
import type { CurveTableFeatures } from '@ui/features/tables/data-table.utils'
import { SizesAndSpaces } from '@ui/features/themes/design/1_sizes_spaces'
import { t } from '@ui/lib/i18n'
import { ErrorCell } from './ErrorCell'

const { Spacing } = SizesAndSpaces

type PositionCellProps = CellContext<CurveTableFeatures, LlamaMarketRow, number | undefined>

// The skeleton is a block, so the cell's text alignment does not move it: the auto margin pushes it to the right
const skeletonProps = { width: 40, sx: { marginInlineStart: 'auto' } } as const

/** Equity of the borrow position in USD */
export const EquityCell = ({ row }: PositionCellProps) => {
  const { data: equityUsd, isLoading, error } = row.original.positionQueries.equityUsd
  return error ? (
    <ErrorCell error={error} />
  ) : (
    <WithSkeleton loading={isLoading} {...skeletonProps}>
      <Typography variant="tableCellValue">{formatNumber(equityUsd, 'usd.notional')}</Typography>
    </WithSkeleton>
  )
}

/** PNL of the borrow position in the collateral token, with the ROE below it and the debt-token PNL on hover */
export const PnlCell = ({ getValue, row }: PositionCellProps) => {
  const { positionQueries, assets } = row.original
  const { data: pnl, isLoading, error } = positionQueries.pnl
  const roe = getValue()
  return error ? (
    <ErrorCell error={error} />
  ) : (
    <WithSkeleton loading={isLoading} {...skeletonProps}>
      <Tooltip
        title={pnl && t`PNL (ROE %)`}
        body={maybe(pnl, ({ debt }) => (
          <DebtPnlTooltipContent pnl={debt} symbol={assets.borrowed.symbol} />
        ))}
        placement="top"
      >
        <Stack sx={{ gap: Spacing.xs, alignItems: 'end' }}>
          <Typography variant="tableCellValueStrong">
            {maybe(
              pnl?.collateral?.pnl,
              value => `${formatSigned(value, 'token.amount')} ${assets.collateral.symbol}`,
            ) ?? UNAVAILABLE_NOTATION}
          </Typography>
          {maybe(roe, roe => (
            <Typography variant="tableCellSupport" color={getChangeColor(roe, 'success', 'error')}>
              {formatSigned(roe, 'percent.value')}
            </Typography>
          ))}
        </Stack>
      </Tooltip>
    </WithSkeleton>
  )
}
