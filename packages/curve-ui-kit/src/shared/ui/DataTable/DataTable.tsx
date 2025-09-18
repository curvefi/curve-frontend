/// <reference types="./DataTable.d.ts" />
import { ReactNode, useEffect, useMemo } from 'react'
import Box from '@mui/material/Box'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import { useLayoutStore } from '@ui-kit/features/layout'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import { type TableItem, type TanstackTable } from './data-table.utils'
import { DataRow, type DataRowProps } from './DataRow'
import { FilterRow } from './FilterRow'
import { HeaderCell } from './HeaderCell'
import { SkeletonRows } from './SkeletonRows'

function useScrollToTopOnFilterChange<T extends TableItem>(table: TanstackTable<T>) {
  const { columnFilters } = table.getState()
  useEffect(() => {
    if (columnFilters.length) {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }, [columnFilters])
}

const { Sizing } = SizesAndSpaces

/**
 * DataTable component to render the table with headers and rows.
 */
export const DataTable = <T extends TableItem>({
  table,
  emptyState,
  children,
  loading,
  options,
  ...rowProps
}: {
  table: TanstackTable<T>
  emptyState: ReactNode
  children?: ReactNode // passed to <FilterRow />
  minRowHeight?: number
  loading: boolean
  options?: {
    maxHeight: string | number // also sets overflowY to 'auto'
    disableStickyHeader?: boolean
  }
} & Omit<DataRowProps<T>, 'row' | 'isLast'>) => {
  const { rows } = table.getRowModel()
  const { shouldStickFirstColumn } = rowProps
  const headerGroups = table.getHeaderGroups()
  const columnCount = useMemo(() => headerGroups.reduce((acc, group) => acc + group.headers.length, 0), [headerGroups])
  const top = useLayoutStore((state) => state.navHeight)
  useScrollToTopOnFilterChange(table)

  const TableComponent = (
    <Table
      sx={{
        backgroundColor: (t) => t.design.Layer[1].Fill,
        borderCollapse: 'separate' /* Don't collapse to avoid funky stuff with the sticky header */,
      }}
      data-testid={!loading && 'data-table'}
    >
      <TableHead
        sx={(t) => ({
          zIndex: t.zIndex.tableHeader,
          position: 'sticky',
          top,
          backgroundColor: t.design.Table.Header.Fill,
          marginBlock: Sizing['sm'],
        })}
        data-testid="data-table-head"
      >
        {children && <FilterRow table={table}>{children}</FilterRow>}

        {headerGroups.map((headerGroup) => (
          <TableRow key={headerGroup.id} sx={{ height: Sizing['xxl'] }}>
            {headerGroup.headers.map((header, index) => (
              <HeaderCell
                key={header.id}
                header={header}
                isSticky={!index && shouldStickFirstColumn}
                width={`calc(100% / ${columnCount})`}
              />
            ))}
          </TableRow>
        ))}
      </TableHead>
      <TableBody>
        {loading ? (
          <SkeletonRows table={table} shouldStickFirstColumn={shouldStickFirstColumn} />
        ) : rows.length === 0 ? (
          emptyState
        ) : (
          <>
            {rows.map((row, index) => (
              <DataRow<T> key={row.id} row={row} isLast={index === rows.length - 1} {...rowProps} />
            ))}
          </>
        )}
      </TableBody>
    </Table>
  )

  return options ? (
    <Box
      sx={{
        maxHeight: options.maxHeight,
        ...(options.maxHeight && { overflowY: 'auto' }),
        ...(options.disableStickyHeader && {
          '& thead': {
            top: '0 !important',
          },
        }),
      }}
    >
      {TableComponent}
    </Box>
  ) : (
    TableComponent
  )
}
