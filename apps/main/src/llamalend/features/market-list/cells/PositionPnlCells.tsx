import { TokenPnlTooltipContent } from '@/llamalend/widgets/tooltips/TokenPnlTooltipContent'
import { getChangeColor } from '@evm-ui/features/activity-table/utils'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { formatNumber } from '@primitives/number.utils'
import { maybe } from '@primitives/objects.utils'
import { Tooltip } from '@ui/components/Tooltip'
import { WithSkeleton } from '@ui/components/WithSkeleton'
import { SizesAndSpaces } from '@ui/features/themes/design/1_sizes_spaces'
import { t } from '@ui/lib/i18n'
import { type PositionCellProps, skeletonProps } from './cell.constants'
import { ErrorCell } from './ErrorCell'

const { Spacing } = SizesAndSpaces

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

/** PNL of the borrow position in USD (debt-token PNL at its USD rate), with its ROI below it and the PNL per token on hover */
export const PnlCell = ({ row }: PositionCellProps) => {
  const { positionQueries, assets } = row.original
  const { data: pnlUsd, isLoading, error } = positionQueries.pnlUsd
  const pnl = positionQueries.pnl.data
  const roi = maybe(pnl?.debt.roi, Number)
  return error ? (
    <ErrorCell error={error} />
  ) : (
    <WithSkeleton loading={isLoading} {...skeletonProps}>
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
          <Typography variant="tableCellValueStrong">{formatNumber(pnlUsd, 'usd.delta')}</Typography>
          {maybe(roi, roi => (
            <Typography variant="tableCellSupport" color={getChangeColor(roi, 'success', 'error')}>
              {formatNumber(roi, 'percent.delta')}
            </Typography>
          ))}
        </Stack>
      </Tooltip>
    </WithSkeleton>
  )
}
