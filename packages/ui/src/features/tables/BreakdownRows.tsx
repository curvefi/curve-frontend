import type { ReactNode } from 'react'
import TableRow from '@mui/material/TableRow'
import Typography from '@mui/material/Typography'
import { type Cell, type Row, type RowData, Subscribe } from '@tanstack/react-table'
import { applySxProps, type SxProps } from '@ui/lib/mui'
import { getCellVariant, type CurveTableFeatures } from './data-table.utils'
import type { RowBreakdownConfig } from './DataRow'
import { useCellSx } from './hooks/useCellSx'

export const BREAKDOWN_ROW_CLASS = 'table-breakdown-row'

const BreakdownCell = <TData extends RowData>({
  cell: { column },
  isSticky,
  children,
}: {
  cell: Cell<CurveTableFeatures, TData>
  isSticky: boolean
  children: ReactNode
}) => {
  const [sx] = useCellSx({ columnType: column.columnDef.meta?.type, isSticky })
  return (
    <Typography
      variant={getCellVariant(column.columnDef.meta?.variant)}
      component="td"
      sx={applySxProps({ color: 'text.primary' }, sx)}
    >
      {children}
    </Typography>
  )
}

export const BreakdownRows = <TData extends RowData, TItem>({
  row,
  items,
  visibleCells,
  config: { getItemKey, cells },
  shouldStickFirstColumn,
  rowSx,
}: {
  row: Row<CurveTableFeatures, TData>
  items: readonly TItem[]
  visibleCells: Cell<CurveTableFeatures, TData>[]
  config: RowBreakdownConfig<TData, TItem>
  shouldStickFirstColumn?: boolean
  rowSx: SxProps
}) => (
  <Subscribe source={row.table.atoms.expanded} selector={() => row.getIsExpanded()}>
    {isExpanded =>
      isExpanded &&
      items.map((item, itemIndex) => (
        <TableRow key={getItemKey(item, itemIndex)} className={BREAKDOWN_ROW_CLASS} sx={rowSx}>
          {visibleCells.map((cell, index) => (
            <BreakdownCell key={cell.id} cell={cell} isSticky={!!shouldStickFirstColumn && !index}>
              {cells[cell.column.id]?.(item, row.original)}
            </BreakdownCell>
          ))}
        </TableRow>
      ))
    }
  </Subscribe>
)
