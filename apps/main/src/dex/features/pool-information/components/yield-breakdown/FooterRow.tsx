import type { ReactNode } from 'react'
import TableCell from '@mui/material/TableCell'
import Typography from '@mui/material/Typography'
import { maybe } from '@primitives/objects.utils'
import type { Column } from '@tanstack/react-table'
import { t } from '@ui-kit/lib/i18n'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import { formatNumber } from '@ui-kit/utils'
import type { YieldBreakdownRow } from './columns/columns.definitions'
import { YieldBreakdownColumnId } from './columns/columns.enum'

const { Spacing } = SizesAndSpaces

type FooterRowProps = {
  visibleColumns: Column<YieldBreakdownRow, unknown>[]
  baseTotal: number
  total: number
}

type FooterCellProps = FooterRowProps & { columnId: YieldBreakdownColumnId }

const footerCellByColumnId: Record<YieldBreakdownColumnId, (props: FooterCellProps) => ReactNode> = {
  [YieldBreakdownColumnId.Source]: ({ columnId }: FooterCellProps) => (
    <TableCell key={columnId} sx={{ paddingInline: Spacing.md }}>
      <Typography variant="tableCellMBold">{t`Total APY`}</Typography>
    </TableCell>
  ),
  [YieldBreakdownColumnId.Price]: ({ columnId }: FooterCellProps) => <TableCell key={columnId} />,
  [YieldBreakdownColumnId.Apy]: ({ columnId, baseTotal, total }: FooterCellProps) => (
    <TableCell key={columnId} sx={{ paddingInline: Spacing.md, paddingBlock: Spacing.sm, textAlign: 'right' }}>
      <Typography variant="tableCellMBold">{formatNumber(total, 'percent.rate')}</Typography>
      {maybe(baseTotal, x => (
        <Typography variant="tableCellSRegular" color="textSecondary">
          {t`Unboosted ${formatNumber(x, 'percent.rate')}`}
        </Typography>
      ))}
    </TableCell>
  ),
}

export const FooterRow = (props: FooterRowProps) =>
  props.visibleColumns.map(({ id }) =>
    footerCellByColumnId[id as YieldBreakdownColumnId]({ columnId: id as YieldBreakdownColumnId, ...props }),
  )
