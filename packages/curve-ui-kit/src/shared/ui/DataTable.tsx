import { ReactNode, useRef } from 'react'
import Typography from '@mui/material/Typography'
import TableHead from '@mui/material/TableHead'
import TableCell from '@mui/material/TableCell'
import TableBody from '@mui/material/TableBody'
import Table from '@mui/material/Table'
import TableRow from '@mui/material/TableRow'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import { useIntersectionObserver } from 'ui'
import { Cell, Column, flexRender, Header, Row, useReactTable } from '@tanstack/react-table'
import { ArrowDownIcon } from '@ui-kit/shared/icons/ArrowDownIcon'
import { TransitionFunction } from '@ui-kit/themes/design/0_primitives'

const { Sizing, Spacing, MinWidth } = SizesAndSpaces

const getAlignment = <T extends unknown>({ columnDef }: Column<T>) =>
  columnDef.meta?.type == 'numeric' ? 'right' : 'left'

const DataCell = <T extends unknown>({ cell }: { cell: Cell<T, unknown> }) => {
  const column = cell.column
  return (
    !column.columnDef.meta?.hidden && (
      <Typography
        variant={column.columnDef.meta?.variant ?? 'tableCellMBold'}
        color="text.primary"
        component="td"
        sx={{
          textAlign: getAlignment(column),
          paddingInline: Spacing.sm,
          paddingBlock: Spacing.xs, // `md` removed, content should be vertically centered
          ...getExtraColumnPadding(column),
        }}
        data-testid={`data-table-cell-${column.id}`}
      >
        {flexRender(column.columnDef.cell, cell.getContext())}
      </Typography>
    )
  )
}

const DataRow = <T extends unknown>({ row, rowHeight }: { row: Row<T>; rowHeight: keyof typeof Sizing }) => {
  const ref = useRef<HTMLTableRowElement>(null)
  const entry = useIntersectionObserver(ref, { freezeOnceVisible: true }) // what about "TanStack Virtual"?
  return (
    <TableRow
      sx={{
        marginBlock: 0,
        height: Sizing[rowHeight],
        borderBottom: '1px solid',
        borderColor: (t) => t.design.Layer[1].Outline,
      }}
      ref={ref}
      data-testid={`data-table-row-${row.id}`}
    >
      {/* render cells when visible vertically, so content is lazy loaded */}
      {entry?.isIntersecting && row.getVisibleCells().map((cell) => <DataCell key={cell.id} cell={cell} />)}
    </TableRow>
  )
}

/**
 * In the figma design, the first and last columns seem to be aligned to the table title.
 * However, the normal padding causes them to be misaligned.
 */
const getExtraColumnPadding = <T extends any>(column: Column<T>) => ({
  ...(column.getIsFirstColumn() && { paddingInlineStart: Spacing.md }),
  ...(column.getIsLastColumn() && { paddingInlineEnd: Spacing.md }),
})

const HeaderCell = <T extends unknown>({ header }: { header: Header<T, unknown> }) => {
  const { column } = header
  const sort = column.getIsSorted()
  const canSort = column.getCanSort()
  return (
    !column.columnDef.meta?.hidden && (
      <Typography
        component="th"
        sx={{
          textAlign: getAlignment(column),
          alignContent: 'end',
          padding: Spacing.sm,
          paddingBlockStart: 0,
          color: `text.${sort ? 'primary' : 'secondary'}`,
          ...getExtraColumnPadding(column),
          ...(canSort && {
            cursor: 'pointer',
            '&:hover': {
              color: `text.highlight`,
            },
            transition: `color ${TransitionFunction}`,
          }),
        }}
        colSpan={header.colSpan}
        width={header.getSize()}
        onClick={column.getToggleSortingHandler()}
        data-testid={`data-table-header-${column.id}`}
        variant="tableHeaderS"
      >
        {flexRender(column.columnDef.header, header.getContext())}
        {canSort && (
          <ArrowDownIcon
            sx={{
              ...(sort === 'asc' && { transform: `rotate(180deg)` }),
              verticalAlign: 'text-bottom',
              fontSize: sort ? 20 : 0,
              transition: `transform ${TransitionFunction}, font-size ${TransitionFunction}`,
            }}
          />
        )}
      </Typography>
    )
  )
}

export const DataTable = <T extends unknown>({
  table,
  headerHeight,
  rowHeight,
  emptyText,
  children,
}: {
  table: ReturnType<typeof useReactTable<T>>
  headerHeight: string
  rowHeight: keyof typeof Sizing
  emptyText: string
  children?: ReactNode
}) => (
  <Table sx={{ minWidth: MinWidth.table, backgroundColor: (t) => t.design.Layer[1].Fill }} data-testid="data-table">
    <TableHead
      sx={(t) => ({
        zIndex: t.zIndex.appBar - 1,
        position: 'sticky',
        top: headerHeight,
        backgroundColor: t.design.Table.Header.Fill,
      })}
      data-testid="data-table-head"
    >
      {children && (
        <TableRow sx={{ height: Sizing['xxl'] }}>
          <TableCell
            colSpan={table.getHeaderGroups().reduce((count, { headers }) => count + headers.length, 0)}
            sx={(t) => ({ backgroundColor: t.design.Layer[1].Fill, padding: 0, borderBottomWidth: 0 })}
            data-testid="table-filters"
          >
            {children}
          </TableCell>
        </TableRow>
      )}

      {table.getHeaderGroups().map((headerGroup) => (
        <TableRow key={headerGroup.id} sx={{ height: Sizing['xxl'] }}>
          {headerGroup.headers.map((header) => (
            <HeaderCell key={header.id} header={header} />
          ))}
        </TableRow>
      ))}
    </TableHead>
    <TableBody>
      {table.getRowModel().rows.length === 0 && (
        <TableRow>
          <Typography
            variant="tableCellL"
            colSpan={table.getHeaderGroups().reduce((count, { headers }) => count + headers.length, 0)}
            component="td"
            padding={7}
            textAlign="center"
          >
            {emptyText}
          </Typography>
        </TableRow>
      )}
      {table.getRowModel().rows.map((row) => (
        <DataRow<T> key={row.id} row={row} rowHeight={rowHeight} />
      ))}
    </TableBody>
  </Table>
)
