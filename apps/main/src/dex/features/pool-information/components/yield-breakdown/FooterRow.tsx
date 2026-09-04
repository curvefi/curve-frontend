import type { ReactNode } from 'react'
import type { CurveTableFeatures } from '@evm-ui/shared/ui/DataTable/data-table.utils'
import { formatNumber } from '@evm-ui/utils'
import TableCell from '@mui/material/TableCell'
import Typography from '@mui/material/Typography'
import type { Column } from '@tanstack/react-table'
import { SizesAndSpaces } from '@ui/features/themes/design/1_sizes_spaces'
import { t } from '@ui/lib/i18n'
import type { YieldBreakdownRow } from './columns/columns.definitions'
import { YieldBreakdownColumnId } from './columns/columns.enum'

const { Spacing } = SizesAndSpaces

type FooterRowProps = {
  visibleColumns: Column<CurveTableFeatures, YieldBreakdownRow>[]
  maxBoostTotal: number
  total: number
}

type FooterCellProps = FooterRowProps & { columnId: YieldBreakdownColumnId }

const footerCellByColumnId: Record<YieldBreakdownColumnId, (props: FooterCellProps) => ReactNode> = {
  [YieldBreakdownColumnId.Source]: ({ columnId }: FooterCellProps) => (
    <TableCell key={columnId} sx={{ paddingInline: Spacing.md }}>
      <Typography variant="tableCellMBold">{t`Total APR`}</Typography>
    </TableCell>
  ),
  [YieldBreakdownColumnId.Price]: ({ columnId }: FooterCellProps) => <TableCell key={columnId} />,
  [YieldBreakdownColumnId.Rate]: ({ columnId, maxBoostTotal, total }: FooterCellProps) => (
    <TableCell key={columnId} sx={{ paddingInline: Spacing.md, paddingBlock: Spacing.sm, textAlign: 'right' }}>
      <Typography variant="tableCellMBold">{formatNumber(total, 'percent.rate')}</Typography>
      {!!maxBoostTotal && maxBoostTotal != total && (
        <Typography variant="tableCellSRegular" color="textSecondary">
          {t`Max boost ${formatNumber(maxBoostTotal, 'percent.rate')}`}
        </Typography>
      )}
    </TableCell>
  ),
}

export const FooterRow = (props: FooterRowProps) =>
  props.visibleColumns.map(({ id }) =>
    footerCellByColumnId[id as YieldBreakdownColumnId]({ columnId: id as YieldBreakdownColumnId, ...props }),
  )
