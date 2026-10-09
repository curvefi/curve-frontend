import type { ReactNode } from 'react'
import TableRow from '@mui/material/TableRow'
import Typography from '@mui/material/Typography'
import type { Cell, Row, RowData } from '@tanstack/react-table'
import { applySxProps } from '@ui/lib/mui'
import { getCellVariant, type CurveTableFeatures } from './data-table.utils'
import type { RowBreakdownConfig } from './DataRow'
import { useCellSx } from './hooks/useCellSx'

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
  config: { getItems, getItemKey, cells },
  shouldStickFirstColumn,
}: {
  row: Row<CurveTableFeatures, TData>
  config: RowBreakdownConfig<TData, TItem>
  shouldStickFirstColumn?: boolean
}) => {
  const items = getItems(row.original)
  const visibleCells = row.getVisibleCells()
  return (
    items.length > 1 &&
    items.map(item => (
      <TableRow key={getItemKey(item)}>
        {visibleCells.map((cell, index) => (
          <BreakdownCell key={cell.id} cell={cell} isSticky={!!shouldStickFirstColumn && !index}>
            {cells[cell.column.id]?.(item, row.original)}
          </BreakdownCell>
        ))}
      </TableRow>
    ))
  )
}
