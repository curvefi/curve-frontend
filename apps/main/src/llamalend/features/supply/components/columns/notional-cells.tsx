import { t } from '@evm-ui/lib/i18n'
import { type CurveTableFeatures, type CurveTableItem } from '@evm-ui/shared/ui/DataTable/data-table.utils'
import { InlineTableCell } from '@evm-ui/shared/ui/DataTable/inline-cells/InlineTableCell'
import { WithSkeleton } from '@evm-ui/shared/ui/WithSkeleton'
import { formatNumber, type SxProps } from '@evm-ui/utils'
import TableCell from '@mui/material/TableCell'
import Typography from '@mui/material/Typography'
import type { CellContext } from '@tanstack/react-table'

type NotionalCellData = CurveTableItem & {
  isLoading?: boolean // used for partial loading states e.g. notional rates
}

const formatNotional = (notional: number | undefined) =>
  notional == null ? '-' : formatNumber(notional, 'usd.notional')

const NotionalTypographyWithSkeleton = ({
  notional,
  isLoading,
}: {
  notional: number | undefined
  isLoading: boolean
}) => (
  <WithSkeleton loading={isLoading} sx={{ maxWidth: 'none', width: '3rem', height: '1lh', display: 'inline-block' }}>
    <Typography variant="tableCellMBold" color="textPrimary" sx={{ textAlign: 'right' }}>
      {formatNotional(notional)}
    </Typography>
  </WithSkeleton>
)

export const NotionalCell = <TRow extends NotionalCellData>({
  row,
  getValue,
}: CellContext<CurveTableFeatures, TRow, number | undefined>) => (
  <InlineTableCell sx={{ alignItems: 'end' }}>
    <NotionalTypographyWithSkeleton notional={getValue()} isLoading={!!row.original.isLoading} />
  </InlineTableCell>
)

export const TotalNotionalRow = ({
  totalNotionals,
  isNotionalLoading,
  sx,
}: {
  totalNotionals: number | undefined
  isNotionalLoading: boolean
  sx?: SxProps
}) => (
  <>
    <TableCell sx={sx}>
      <Typography variant="tableCellMBold" color="textPrimary" data-testid="rewards-value">
        {t`Rewards value`}
      </Typography>
    </TableCell>
    <TableCell sx={sx} align="right">
      <NotionalTypographyWithSkeleton notional={totalNotionals} isLoading={isNotionalLoading} />
    </TableCell>
  </>
)
