/// <reference types="./DataTable.d.ts" />
import { ReactNode, useEffect, useEffectEvent, useMemo, useRef } from 'react'
import Box from '@mui/material/Box'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableFooter from '@mui/material/TableFooter'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import { useLayoutStore } from '@ui-kit/features/layout'
import { t } from '@ui-kit/lib/i18n'
import { TablePagination } from '@ui-kit/shared/ui/DataTable/TablePagination'
import { WithWrapper } from '@ui-kit/shared/ui/WithWrapper'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import { type TableItem, type TanstackTable } from './data-table.utils'
import { DataRow, type DataRowProps } from './DataRow'
import { FilterRow } from './FilterRow'
import { HeaderCell } from './HeaderCell'
import { SkeletonRows } from './SkeletonRows'
import { TableViewAllCell } from './TableViewAllCell'
import { useTableRowLimit } from './useTableRowLimit'

/**
 * Scrolls to the top of the window whenever the column filters change.
 */
function useScrollToTopOnFilterChange<T extends TableItem>(table: TanstackTable<T>) {
  const { columnFilters } = table.getState()
  useEffect(() => {
    if (columnFilters.length) {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }, [columnFilters])
}

/**
 * Resets the table pagination to the first page whenever the number of filtered results changes.
 */
function useResetPageOnResultChange<T extends TableItem>(table: TanstackTable<T>) {
  const resultCount = table.getFilteredRowModel().rows.length
  const onPaginationChangeEvent = useEffectEvent(table.setPagination)
  const lastResultCount = useRef<number>(resultCount)
  useEffect(() => {
    // Reset to first page, only if we had results before (links must keep working)
    if (lastResultCount.current) onPaginationChangeEvent((prev) => ({ ...prev, pageIndex: 0 }))
    lastResultCount.current = resultCount
  }, [resultCount])
}

const { Sizing } = SizesAndSpaces

/**
 * DataTable component to render the table with headers and rows.
 */
export const DataTable = <T extends TableItem>({
  emptyState,
  children,
  loading,
  maxHeight,
  rowLimit,
  viewAllLabel,
  ...rowProps
}: {
  table: TanstackTable<T>
  emptyState: ReactNode
  children?: ReactNode // passed to <FilterRow />
  loading: boolean
  maxHeight?: `${number}rem` // also sets overflowY to 'auto'
  rowLimit?: number
  viewAllLabel?: string
} & Omit<DataRowProps<T>, 'row' | 'isLast'>) => {
  const { table, shouldStickFirstColumn } = rowProps
  const { rows } = table.getRowModel()
  const { isLimited, isLoading: isLoadingViewAll, handleShowAll } = useTableRowLimit(rowLimit)
  // When number of rows are limited, show only rowLimit rows
  const visibleRows = isLimited && rowLimit ? rows.slice(0, rowLimit) : rows
  const showViewAllButton = isLimited && rows.length > rowLimit!
  // pagination should bw shown if no rows limit and if needed
  const showPagination = !isLimited && table.getPageCount() > 1

  const headerGroups = table.getHeaderGroups()
  // eslint-disable-next-line react-hooks/preserve-manual-memoization
  const columnCount = useMemo(() => headerGroups.reduce((acc, group) => acc + group.headers.length, 0), [headerGroups])
  const top = useLayoutStore((state) => state.navHeight)
  useScrollToTopOnFilterChange(table)
  useResetPageOnResultChange(table)

  return (
    <WithWrapper Wrapper={Box} shouldWrap={maxHeight} sx={{ maxHeight, overflowY: 'auto' }}>
      <Table
        sx={useMemo(
          () => ({
            backgroundColor: (t) => t.design.Layer[1].Fill,
            borderCollapse: 'separate' /* Don't collapse to avoid funky stuff with the sticky header */,
          }),
          [],
        )}
        data-testid={!loading && 'data-table'}
      >
        <TableHead
          sx={useMemo(
            () => (t) => ({
              position: 'sticky',
              top: maxHeight ? 0 : top,
              zIndex: t.zIndex.tableHeader,
              backgroundColor: t.design.Table.Header.Fill,
              marginBlock: Sizing['sm'],
            }),
            [maxHeight, top],
          )}
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
            visibleRows.map((row, index) => (
              <DataRow<T> key={row.id} row={row} isLast={index === visibleRows.length - 1} {...rowProps} />
            ))
          )}
        </TableBody>
        {(showPagination || showViewAllButton) && (
          <TableFooter>
            <TableRow>
              {showViewAllButton && (
                <TableViewAllCell colSpan={columnCount} onClick={handleShowAll} isLoading={isLoadingViewAll}>
                  {viewAllLabel || t`View all`}
                </TableViewAllCell>
              )}
              {showPagination && (
                <TableCell colSpan={columnCount}>
                  <TablePagination table={table} />
                </TableCell>
              )}
            </TableRow>
          </TableFooter>
        )}
      </Table>
    </WithWrapper>
  )
}
