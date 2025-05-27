/// <reference types="./DataTable.d.ts" />
import { ReactNode } from 'react'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import { type TableItem, type TanstackTable } from './data-table.utils'
import { DataRow, type DataRowProps } from './DataRow'
import { EmptyStateRow } from './EmptyStateRow'
import { FilterRow } from './FilterRow'
import { HeaderCell } from './HeaderCell'

const { Sizing } = SizesAndSpaces

/**
 * DataTable component to render the table with headers and rows.
 */
export const DataTable = <T extends TableItem>({
  table,
  headerHeight,
  emptyText,
  children,
  ...rowProps
}: {
  table: TanstackTable<T>
  headerHeight: string
  emptyText: string
  children?: ReactNode // passed to <FilterRow />
  minRowHeight?: number
} & Omit<DataRowProps<T>, 'row' | 'isLast'>) => {
  const { rows } = table.getRowModel()
  const { shouldStickFirstColumn } = rowProps
  return (
    <Table
      sx={{
        backgroundColor: (t) => t.design.Layer[1].Fill,
        borderCollapse: 'separate' /* Don't collapse to avoid funky stuff with the sticky header */,
      }}
      data-testid="data-table"
    >
      <TableHead
        sx={(t) => ({
          zIndex: t.zIndex.tableHeader,
          position: 'sticky',
          top: headerHeight,
          backgroundColor: t.design.Table.Header.Fill,
          marginBlock: Sizing['sm'],
        })}
        data-testid="data-table-head"
      >
        {children && <FilterRow table={table}>{children}</FilterRow>}

        {table.getHeaderGroups().map((headerGroup) => (
          <TableRow key={headerGroup.id} sx={{ height: Sizing['xxl'] }}>
            {headerGroup.headers.map((header, index) => (
              <HeaderCell
                key={header.id}
                header={header}
                isFirst={!index}
                isLast={index == headerGroup.headers.length - 1}
                isSticky={!index && shouldStickFirstColumn}
              />
            ))}
          </TableRow>
        ))}
      </TableHead>
      <TableBody>
        {rows.length === 0 && <EmptyStateRow table={table}>{emptyText}</EmptyStateRow>}
        {rows.map((row, index) => (
          <DataRow<T> key={row.id} row={row} isLast={index === rows.length - 1} {...rowProps} />
        ))}
      </TableBody>
    </Table>
  )
}
