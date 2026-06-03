/// <reference types="./DataTable.d.ts" />
import { type ReactNode, type RefObject, useEffect, useEffectEvent, useMemo, useRef } from 'react'
import Box from '@mui/material/Box'
import { Theme } from '@mui/material/styles'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableFooter from '@mui/material/TableFooter'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import { useLayoutStore } from '@ui-kit/features/layout'
import { IncreasingLengthOptions } from '@ui-kit/hooks/useIncreasingLength'
import { t } from '@ui-kit/lib/i18n'
import { TablePagination } from '@ui-kit/shared/ui/DataTable/TablePagination'
import { WithWrapper } from '@ui-kit/shared/ui/WithWrapper'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import { DataTableHeaderHeight, type DataTableSize, type TableItem, type TanstackTable } from './data-table.utils'
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
 * Scrolls to the top of the table container whenever the page changes with manual pagination.
 */
function useScrollToTopOnPageChange<T extends TableItem>(
  table: TanstackTable<T>,
  containerRef: RefObject<HTMLElement | null>,
) {
  const { pageIndex } = table.getState().pagination
  useEffect(() => {
    containerRef.current?.scrollTo({ top: 0, behavior: 'smooth' })
  }, [pageIndex, containerRef])
}

/**
 * Resets the table pagination to the first page whenever the number of filtered results changes.
 * Skipped for manual pagination since data changes on every page change.
 */
function useResetPageOnResultChange<T extends TableItem>(table: TanstackTable<T>) {
  const isManualPagination = table.options.manualPagination
  const resultCount = table.getFilteredRowModel().rows.length
  const onPaginationChangeEvent = useEffectEvent(table.setPagination)
  const lastResultCountRef = useRef<number>(resultCount)
  useEffect(() => {
    // Skip for manual pagination - data is expected to change on page change
    if (isManualPagination) return
    // Reset to first page, but only if result amount wasn't 0 (links must keep working while data might still be loading)
    if (lastResultCountRef.current && resultCount) onPaginationChangeEvent(prev => ({ ...prev, pageIndex: 0 }))
    lastResultCountRef.current = resultCount
  }, [resultCount, isManualPagination])
}

const { Sizing } = SizesAndSpaces

/**
 * DataTable component to render the table with headers and rows.
 */
export const DataTable = <T extends TableItem>({
  emptyState,
  children,
  isLoading,
  size = 'small',
  maxHeight,
  defaultVisibleRows,
  disableStickyHeader,
  shouldStickFirstColumn = false,
  hideHeader = false,
  footerRow,
  increasingLengthOptions,
  ...rowProps
}: {
  table: TanstackTable<T>
  emptyState: ReactNode
  children?: ReactNode // passed to <FilterRow />
  isLoading: boolean
  size?: DataTableSize
  maxHeight?: `${number}rem` // also sets overflowY to 'auto'
  // maximum number of visible rows and the button's label to expand them all
  defaultVisibleRows?: { max: number; buttonLabel: string }
  disableStickyHeader?: boolean
  hideHeader?: boolean
  footerRow?: ReactNode
  increasingLengthOptions?: IncreasingLengthOptions // optional props for the SkeletonRows
} & Omit<DataRowProps<T>, 'row' | 'isLastRow' | 'shouldStickLastRowToTop'>) => {
  const { table } = rowProps
  const { max: rowLimit, buttonLabel: viewAllLabel } = defaultVisibleRows ?? {}
  const { rows } = table.getRowModel()
  const { isLimited, isLoading: isLoadingViewAll, onShowAll } = useTableRowLimit(rowLimit, rows.length)
  // When number of rows are limited, show only rowLimit rows
  const visibleRows = isLimited ? rows.slice(0, rowLimit) : rows
  const showViewAllButton = isLimited && rows.length > rowLimit!
  // pagination should bw shown if no rows limit and if needed
  const showPagination = !isLimited && table.getPageCount() > 1

  const headerGroups = table.getHeaderGroups()
  const columnCount = useMemo(() => headerGroups.reduce((acc, group) => acc + group.headers.length, 0), [headerGroups])
  const top = useLayoutStore(state => state.navHeight)
  const containerRef = useRef<HTMLDivElement>(null)
  useScrollToTopOnFilterChange(table)
  useResetPageOnResultChange(table)
  useScrollToTopOnPageChange(table, containerRef)
  const tableHeaderSx = (t: Theme) => ({
    ...(!disableStickyHeader && {
      position: 'sticky',
      top: maxHeight ? 0 : top,
      zIndex: t.zIndex.tableHeader,
    }),
    marginBlock: Sizing.sm,
  })
  const shouldStickLastRowToTop = !disableStickyHeader && !hideHeader
  const showFooter = !isLoading && (showPagination || showViewAllButton || footerRow)

  return (
    <WithWrapper Wrapper={Box} shouldWrap={maxHeight} sx={{ maxHeight, overflowY: 'auto' }} ref={containerRef}>
      <Table
        sx={{ borderCollapse: 'separate' /* Don't collapse to avoid funky stuff with the sticky header */ }}
        data-testid={!isLoading && 'data-table'}
      >
        {!hideHeader && (
          <TableHead sx={tableHeaderSx} data-testid="data-table-head">
            {children && <FilterRow table={table}>{children}</FilterRow>}

            {headerGroups.map(headerGroup => (
              <TableRow key={headerGroup.id} sx={{ height: DataTableHeaderHeight[size] }}>
                {headerGroup.headers.map((header, index) => (
                  <HeaderCell
                    key={header.id}
                    header={header}
                    size={size}
                    isSticky={!index && shouldStickFirstColumn}
                    width={`calc(100% / ${columnCount})`}
                  />
                ))}
              </TableRow>
            ))}
          </TableHead>
        )}
        <TableBody>
          {isLoading ? (
            <SkeletonRows table={table} shouldStickFirstColumn={shouldStickFirstColumn} {...increasingLengthOptions} />
          ) : rows.length === 0 ? (
            emptyState
          ) : (
            visibleRows.map((row, index) => (
              <DataRow<T>
                key={row.id}
                row={row}
                isLastRow={index === visibleRows.length - 1}
                shouldStickLastRowToTop={shouldStickLastRowToTop}
                shouldStickFirstColumn={shouldStickFirstColumn}
                {...rowProps}
              />
            ))
          )}
        </TableBody>
        {showFooter && (
          <TableFooter>
            {footerRow && <TableRow>{footerRow}</TableRow>}
            {showViewAllButton && (
              <TableRow>
                <TableViewAllCell colSpan={columnCount} onClick={onShowAll} isLoading={isLoadingViewAll}>
                  {viewAllLabel || t`View all`}
                </TableViewAllCell>
              </TableRow>
            )}
            {showPagination && (
              <TableRow>
                <TableCell colSpan={columnCount}>
                  <TablePagination table={table} />
                </TableCell>
              </TableRow>
            )}
          </TableFooter>
        )}
      </Table>
    </WithWrapper>
  )
}
