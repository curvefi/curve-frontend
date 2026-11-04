import { TokenPnlTooltipContent } from '@/llamalend/widgets/tooltips/TokenPnlTooltipContent'
import { getChangeColor } from '@evm-ui/features/activity-table/utils'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { formatNumber } from '@primitives/number.utils'
import { maybe } from '@primitives/objects.utils'
import { Tooltip } from '@ui/components/Tooltip'
import { SizesAndSpaces } from '@ui/features/themes/design/1_sizes_spaces'
import { t } from '@ui/lib/i18n'
import type { PositionCellProps } from './cell.constants'

const { Spacing } = SizesAndSpaces

/** Equity of the borrow position in USD */
export const EquityCell = ({ getValue }: PositionCellProps) => (
  <Typography variant="tableCellValue">{formatNumber(getValue(), 'usd.notional')}</Typography>
)

/** PNL of the borrow position in USD (debt-token PNL at its USD rate), with its ROI below it and the PNL per token on hover */
export const PnlCell = ({ row, getValue }: PositionCellProps) => {
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
