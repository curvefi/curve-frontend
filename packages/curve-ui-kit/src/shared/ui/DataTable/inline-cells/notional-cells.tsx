import TableCell from '@mui/material/TableCell'
import Typography from '@mui/material/Typography'
import { CellContext } from '@tanstack/react-table'
import { t } from '@ui-kit/lib/i18n'
import { type TableItem } from '@ui-kit/shared/ui/DataTable/data-table.utils'
import { InlineTableCell } from '@ui-kit/shared/ui/DataTable/inline-cells/InlineTableCell'
import { WithSkeleton } from '@ui-kit/shared/ui/WithSkeleton'
import { formatUsd, type SxProps } from '@ui-kit/utils'

const formatNotional = (notional: number | undefined) => (notional == null ? '-' : formatUsd(notional))

const NotionalTypographyWithSkeleton = ({
  notional,
  isLoading,
}: {
  notional: number | undefined
  isLoading: boolean
}) => (
  <WithSkeleton loading={isLoading} sx={{ maxWidth: 'none', width: '3rem', height: '1lh', display: 'inline-block' }}>
    <Typography variant="tableCellMBold" color="textPrimary" textAlign="right">
      {formatNotional(notional)}
    </Typography>
  </WithSkeleton>
)

export const NotionalCell = <TRow extends TableItem>({ getValue, table }: CellContext<TRow, number | undefined>) => (
  <InlineTableCell sx={{ alignItems: 'end' }}>
    <NotionalTypographyWithSkeleton notional={getValue()} isLoading={!!table.options.meta?.isLoading} />
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
      <Typography variant="tableCellMBold" color="textPrimary">{t`Rewards value`}</Typography>
    </TableCell>
    <TableCell sx={sx} align="right">
      <NotionalTypographyWithSkeleton notional={totalNotionals} isLoading={isNotionalLoading} />
    </TableCell>
  </>
)
