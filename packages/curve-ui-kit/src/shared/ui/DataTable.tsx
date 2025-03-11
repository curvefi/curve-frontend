import { useRouter } from 'next/navigation' // Can't use SxProps for some reason inside an sx *function*
import { type MouseEvent, ReactNode, useCallback, useRef } from 'react'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import Typography from '@mui/material/Typography'
import type { SystemStyleObject, Theme } from '@mui/system' // Can't use SxProps for some reason inside an sx *function*
import { Cell, Column, flexRender, Header, Row, useReactTable } from '@tanstack/react-table'
import useIntersectionObserver from '@ui-kit/hooks/useIntersectionObserver'
import { ArrowDownIcon } from '@ui-kit/shared/icons/ArrowDownIcon'
import { TransitionFunction } from '@ui-kit/themes/design/0_primitives'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import { hasParentWithClass } from '@ui-kit/utils/dom'
import { InvertOnHover } from './InvertOnHover'

const { Sizing, Spacing, MinWidth, MinHeight } = SizesAndSpaces

// until we know whether the rows are visible, we assume this number to avoid layout shift
const AssumeRowsVisible = 10

// css class to hide elements on desktop unless the row is hovered
export const DesktopOnlyHoverClass = 'desktop-only-on-hover'

// css class to make elements clickable in a row and ignore the row click
export const ClickableInRowClass = 'clickable-in-row'

type TableItem = { url: string }

const getAlignment = <T extends TableItem>({ columnDef }: Column<T>) =>
  columnDef.meta?.type == 'numeric' ? 'right' : 'left'

const DataCell = <T extends TableItem>({ cell }: { cell: Cell<T, unknown> }) => {
  const column = cell.column
  const { hidden, variant, borderRight } = column.columnDef.meta ?? {}
  return (
    !hidden && (
      <Typography
        variant={variant ?? 'tableCellMBold'}
        color="text.primary"
        component="td"
        sx={{
          textAlign: getAlignment(column),
          paddingInline: Spacing.sm,
          paddingBlock: Spacing.xs, // `md` removed, content should be vertically centered
          ...getExtraColumnPadding(column),
          transition: `color ${TransitionFunction}, border-right ${TransitionFunction}`,
          ...(borderRight && { borderRight: (t) => `1px solid ${t.design.Layer[1].Outline}` }),
        }}
        data-testid={`data-table-cell-${column.id}`}
      >
        {flexRender(column.columnDef.cell, cell.getContext())}
      </Typography>
    )
  )
}

const DataRow = <T extends TableItem>({ row, sx }: { row: Row<T>; sx?: SystemStyleObject<Theme> }) => {
  const ref = useRef<HTMLTableRowElement>(null)
  const { push } = useRouter()
  const entry = useIntersectionObserver(ref, { freezeOnceVisible: true }) // what about "TanStack Virtual"?
  const url = row.original.url
  const onClick = useCallback(
    (e: MouseEvent<HTMLTableRowElement>) => {
      // ignore clicks on elements that should be clickable inside the row
      if (hasParentWithClass(e.target, ClickableInRowClass, { untilTag: 'TR' })) return
      // redirect to the url or navigate to the route
      if (url.startsWith('http')) {
        location.href = url
      } else {
        push(url)
      }
    },
    [url, push],
  )
  return (
    <InvertOnHover hoverColor={(t) => t.design.Table.Row.Hover} hoverRef={ref}>
      <TableRow
        sx={{
          marginBlock: 0,
          borderBottom: (t) => `1px solid ${t.design.Layer[1].Outline}`,
          cursor: 'pointer',
          transition: `border ${TransitionFunction}`,
          [`& .${DesktopOnlyHoverClass}`]: { opacity: { desktop: 0 }, transition: `opacity ${TransitionFunction}` },
          '&:hover': {
            [`& .${DesktopOnlyHoverClass}`]: { opacity: { desktop: '100%' } },
          },
          ...sx,
        }}
        ref={ref}
        data-testid={`data-table-row-${row.id}`}
        onClick={onClick}
      >
        {/* render cells when visible vertically, so content is lazy loaded */}
        {(entry?.isIntersecting || row.index < AssumeRowsVisible) &&
          row.getVisibleCells().map((cell) => <DataCell key={cell.id} cell={cell} />)}
      </TableRow>
    </InvertOnHover>
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

const HeaderCell = <T extends TableItem>({ header }: { header: Header<T, unknown> }) => {
  const { column } = header
  const sort = column.getIsSorted()
  const canSort = column.getCanSort()
  const { hidden, borderRight } = column.columnDef.meta ?? {}
  return (
    !hidden && (
      <Typography
        component="th"
        sx={{
          textAlign: getAlignment(column),
          verticalAlign: 'bottom',
          padding: Spacing.sm,
          paddingBlockStart: 0,
          color: `text.${sort ? 'primary' : 'secondary'}`,
          ...getExtraColumnPadding(column),
          ...(canSort && {
            cursor: 'pointer',
            '&:hover': {
              color: `text.highlight`,
            },
            transition: `color ${TransitionFunction}, border-right ${TransitionFunction}`,
          }),
          ...(borderRight && { borderRight: (t) => `1px solid ${t.design.Layer[1].Outline}` }),
        }}
        colSpan={header.colSpan}
        width={header.getSize()}
        onClick={column.getToggleSortingHandler()}
        data-testid={`data-table-header-${column.id}`}
        variant="tableHeaderS"
      >
        {flexRender(column.columnDef.header, header.getContext())}
        <ArrowDownIcon
          sx={{
            ...(sort === 'asc' && { transform: `rotate(180deg)` }),
            verticalAlign: 'text-bottom',
            fontSize: sort ? 20 : 0,
            transition: `transform ${TransitionFunction}, font-size ${TransitionFunction}`,
            visibility: canSort ? 'visible' : 'hidden', // render it invisible to avoid layout shift
          }}
        />
      </Typography>
    )
  )
}

export const DataTable = <T extends TableItem>({
  table,
  headerHeight,
  emptyText,
  children,
  rowSx,
}: {
  table: ReturnType<typeof useReactTable<T>>
  headerHeight: string
  emptyText: string
  children?: ReactNode
  rowSx?: SystemStyleObject<Theme>
  minRowHeight?: number
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
        <TableRow data-testid="table-empty-row" sx={{ height: MinHeight.tableNoResults }}>
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
        <DataRow<T> key={row.id} row={row} sx={rowSx} />
      ))}
    </TableBody>
  </Table>
)
