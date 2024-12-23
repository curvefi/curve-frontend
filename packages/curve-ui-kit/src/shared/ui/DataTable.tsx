import { useRef } from 'react'
import Typography from '@mui/material/Typography'
import TableHead from '@mui/material/TableHead'
import TableCell from '@mui/material/TableCell'
import TableBody from '@mui/material/TableBody'
import Table from '@mui/material/Table'
import TableRow from '@mui/material/TableRow'
import { SizesAndSpaces } from '../../themes/design/1_sizes_spaces'
import { useIntersectionObserver } from 'ui'
import { Column, Cell, ColumnDef, flexRender, getCoreRowModel, Header, Row, useReactTable } from '@tanstack/react-table'

const { Sizing, Spacing, MinWidth } = SizesAndSpaces

const getAlignment = <T extends any>({ columnDef }: Column<T>) => (columnDef.meta?.type == 'numeric' ? 'right' : 'left')

const DataCell = <T extends unknown>({ cell }: { cell: Cell<T, unknown> }) => {
  const column = cell.column
  return (
    <TableCell
      sx={{ textAlign: getAlignment(column), alignContent: 'end', paddingInline: Spacing.sm, paddingBlock: Spacing.md }}
    >
      <Typography variant="tableCellMBold" color="text.primary">
        {flexRender(column.columnDef.cell, cell.getContext())}
      </Typography>
    </TableCell>
  )
}

const DataRow = <T extends unknown>({ row }: { row: Row<T> }) => {
  const ref = useRef<HTMLTableRowElement>(null)
  const entry = useIntersectionObserver(ref, { freezeOnceVisible: true })
  return (
    <TableRow
      sx={{
        marginBlock: 0,
        height: Sizing['3xl'],
        borderBottom: '1px solid',
        borderColor: (t) => t.design.Layer[1].Outline,
      }}
      ref={ref}
      // title={JSON.stringify(row.original)}
      data-testid={`data-table-row-${row.id}`}
    >
      {entry?.isIntersecting && row.getVisibleCells().map((cell) => <DataCell key={cell.id} cell={cell} />)}
    </TableRow>
  )
}

const HeaderCell = <T extends unknown>({ header }: { header: Header<T, unknown> }) => (
  <TableCell
    sx={{ textAlign: getAlignment(header.column), alignContent: 'end', padding: Spacing.sm, paddingTop: 0 }}
    colSpan={header.colSpan}
  >
    <Typography variant="tableHeaderS" color="text.secondary">
      {flexRender(header.column.columnDef.header, header.getContext())}
    </Typography>
  </TableCell>
)

export const DataTable = <T extends unknown>({
  columns,
  data,
  headerHeight,
}: {
  data: T[]
  columns: ColumnDef<T, any>[]
  headerHeight: string
}) => {
  const table = useReactTable<T>({
    columns,
    data,
    getCoreRowModel: getCoreRowModel(),
  })
  return (
    <Table sx={{ minWidth: MinWidth.table }} data-testid="data-table">
      <TableHead
        sx={(t) => ({
          zIndex: t.zIndex.appBar - 1,
          position: 'sticky',
          top: headerHeight,
          backgroundColor: t.design.Table.Header_Fill,
        })}
        data-testid="data-table-head"
      >
        {table.getHeaderGroups().map((headerGroup) => (
          <TableRow key={headerGroup.id} sx={{ height: Sizing['3xl'] }}>
            {headerGroup.headers.map((header) => (
              <HeaderCell key={header.id} header={header} />
            ))}
          </TableRow>
        ))}
      </TableHead>
      <TableBody>
        {table.getRowModel().rows.map((row) => (
          <DataRow<T> key={row.id} row={row} />
        ))}
      </TableBody>
    </Table>
  )
}
