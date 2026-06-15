/// <reference types="./DataTable.d.ts" />
import { type ReactNode, useEffect, useEffectEvent, useMemo, useRef } from 'react'
import Box from '@mui/material/Box'
import { Theme } from '@mui/material/styles'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableFooter from '@mui/material/TableFooter'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import { useLayoutStore } from '@ui-kit/features/layout'
import { useIsMobile } from '@ui-kit/hooks/useBreakpoints'
import { IncreasingLengthOptions } from '@ui-kit/hooks/useIncreasingLength'
import { t } from '@ui-kit/lib/i18n'
import { TablePagination } from '@ui-kit/shared/ui/DataTable/TablePagination'
import { WithWrapper } from '@ui-kit/shared/ui/WithWrapper'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import { DataTableHeaderHeight, type DataTableSize, type TableItem, type TanstackTable } from './data-table.utils'
import { DataRow, type DataRowProps } from './DataRow'
import { FilterRow } from './FilterRow'
import { HeaderCell } from './HeaderCell'
import { useScrollToTopOnFilterChange, useScrollToTopOnPageChange } from './hooks/useTableScroll'
import { useTableStickyHeader } from './hooks/useTableStickyHeader'
import { SkeletonRows } from './SkeletonRows'
import { TableViewAllCell } from './TableViewAllCell'
import { useTableRowLimit } from './useTableRowLimit'

const TABLE_FILTERS_TEST_ID = 'table-filters'

const { Height } = SizesAndSpaces

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
/**
 * DataTable component to render the table with headers and rows.
 * The table header stays sticky only when enabled, rows are not limited, and table content fits within its parent.
 * When the table is wider than its parent, the header stops being sticky and the table becomes horizontally scrollable.
 */
export const DataTable = <T extends TableItem>({
  emptyState,
  children,
  isLoading,
  size = 'small',
  maxHeight,
  defaultVisibleRows,
  disableStickyHeader = false,
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
  disableStickyHeader?: boolean // can also be disabled by limited rows or table width overflow.
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
  const tableTopRef = useRef<HTMLDivElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const { shouldStickyHeader, tableRef, tableWrapperRef } = useTableStickyHeader({ disableStickyHeader, isLimited })
  useScrollToTopOnFilterChange({ table, tableTopRef })
  useScrollToTopOnPageChange({ table, tableTopRef, containerRef })
  useResetPageOnResultChange(table)
  const tableHeaderSx = (t: Theme) => ({
    ...(shouldStickyHeader && {
      position: 'sticky',
      top: maxHeight ? 0 : top,
      zIndex: t.zIndex.tableHeader,
      marginBlockEnd: Height.row, // last row should not be hidden by the sticky header
    }),
  })
  const showFooter = !isLoading && (showPagination || showViewAllButton || footerRow)

  return (
    <WithWrapper Wrapper={Box} shouldWrap={maxHeight} sx={{ maxHeight, overflowY: 'auto' }} ref={containerRef}>
      {/* Anchor used to scroll back to the table without hiding it behind the sticky nav. */}
      <Box ref={tableTopRef} sx={{ scrollMarginTop: `${top}px` }} />
      {/* Children are placed outside the table header when the table content is horizontally scrollable in order to
      preserve the parent's width instead of the table's scroll width. */}
      {!shouldStickyHeader && children && <Box data-testid={TABLE_FILTERS_TEST_ID}>{children}</Box>}
      <Box
        ref={tableWrapperRef}
        sx={{ ...(!shouldStickyHeader && { overflowX: 'auto' }) }}
        data-testid="data-table-scroll-wrapper"
      >
        <Table
          ref={tableRef}
          sx={{
            borderCollapse: 'separate', // Don't collapse to avoid funky stuff with the sticky header
            // Prevent a long content of a column to push the other column outside the viewport
            ...(useIsMobile() && { tableLayout: 'fixed' }),
          }}
          data-testid={!isLoading && 'data-table'}
        >
          {!hideHeader && (
            <TableHead sx={tableHeaderSx} data-testid="data-table-head">
              {children && shouldStickyHeader && (
                <FilterRow table={table} testId={TABLE_FILTERS_TEST_ID}>
                  {children}
                </FilterRow>
              )}
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
              <SkeletonRows
                table={table}
                shouldStickFirstColumn={shouldStickFirstColumn}
                {...increasingLengthOptions}
              />
            ) : rows.length === 0 ? (
              emptyState
            ) : (
              visibleRows.map(row => (
                <DataRow<T> key={row.id} row={row} shouldStickFirstColumn={shouldStickFirstColumn} {...rowProps} />
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
      </Box>
    </WithWrapper>
  )
}
