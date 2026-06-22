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
import type { IncreasingLengthCategory } from '@ui-kit/hooks/useIncreasingLength'
import { t } from '@ui-kit/lib/i18n'
import { TablePagination } from '@ui-kit/shared/ui/DataTable/TablePagination'
import { WithWrapper } from '@ui-kit/shared/ui/WithWrapper'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import { EmptyStateCard, EmptyStateCardProps } from '../EmptyStateCard'
import { ErrorMessage } from '../ErrorMessage'
import { DataTableHeaderHeight, type DataTableSize, type TableItem, type TanstackTable } from './data-table.utils'
import { DataRow, type DataRowProps } from './DataRow'
import { EmptyStateRow, type EmptyStateRowSize } from './EmptyStateRow'
import { FilterRow } from './FilterRow'
import { HeaderCell } from './HeaderCell'
import { useScrollToTopOnFilterChange, useScrollToTopOnPageChange } from './hooks/useTableScroll'
import { useTableStickyHeader } from './hooks/useTableStickyHeader'
import { SkeletonRows } from './SkeletonRows'
import { TableViewAllCell } from './TableViewAllCell'
import { useTableRowLimit } from './useTableRowLimit'

const TABLE_FILTERS_TEST_ID = 'table-filters'

const { Height } = SizesAndSpaces

type TableEmptyState = {
  emptyTitle?: EmptyStateCardProps['title']
  emptyMessage?: EmptyStateCardProps['description']
  emptyButton?: EmptyStateCardProps['button']
  emptySecondaryButton?: EmptyStateCardProps['secondaryButton']
  errorTitle?: EmptyStateCardProps['title']
  errorMessage?: EmptyStateCardProps['description']
  onReload?: () => Promise<unknown> | void
}

type DataTableCategoryConfig = {
  size: DataTableSize
  maxHeight?: `${number}rem` // also sets overflowY to 'auto'
  defaultVisibleRows?: number // maximum number of visible rows
  disableStickyHeader?: boolean // can also be disabled by limited rows or table width overflow.
  hideHeader?: boolean
  increasingLength: IncreasingLengthCategory
  emptyStateSize: NonNullable<EmptyStateCardProps['size']>
  emptyStateRowSize: EmptyStateRowSize
}

export type DataTableCategory = keyof typeof DATA_TABLE_CATEGORIES

const DATA_TABLE_CATEGORIES = {
  // Default full table for primary searchable/filterable lists.
  list: {
    size: 'small',
    increasingLength: 'default',
    emptyStateSize: 'md',
    emptyStateRowSize: 'lg',
  },
  // User/list preview table that starts short and reveals all rows via a footer action.
  limited: {
    size: 'small',
    defaultVisibleRows: 3,
    increasingLength: 'limited',
    emptyStateSize: 'md',
    emptyStateRowSize: 'lg',
  },
  // Long activity/history table constrained inside a scrollable viewport.
  scrollable: {
    size: 'small',
    maxHeight: SizesAndSpaces.MaxHeight.userEventsTable,
    increasingLength: 'default',
    emptyStateSize: 'md',
    emptyStateRowSize: 'sm',
  },
  // Compact contextual detail table inside a secondary card or advanced-details section.
  detail: {
    size: 'small',
    disableStickyHeader: true,
    increasingLength: 'disabled',
    emptyStateSize: 'sm',
    emptyStateRowSize: 'sm',
  },
  // Compact form/action summary table, usually without visible column headers.
  form: {
    size: 'small',
    disableStickyHeader: true,
    hideHeader: true,
    increasingLength: 'disabled',
    emptyStateSize: 'sm',
    emptyStateRowSize: 'sm',
  },
} as const satisfies Record<string, DataTableCategoryConfig>

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
  category = 'list',
  emptyState,
  children,
  shouldStickFirstColumn = false,
  footerRow,
  viewAllLabel,
  ...rowProps
}: {
  category?: DataTableCategory
  table: TanstackTable<T>
  // Optional overrides for the built-in empty/error state title, description, and action button.
  emptyState?: TableEmptyState
  children?: ReactNode // passed to <FilterRow />
  footerRow?: ReactNode
  viewAllLabel?: string // button's label to expand all rows. defaultVisibleRows must be first set
} & Omit<DataRowProps<T>, 'table' | 'row'>) => {
  const {
    size,
    maxHeight,
    defaultVisibleRows: rowLimit,
    disableStickyHeader = false,
    hideHeader = false,
    increasingLength,
    emptyStateSize,
    emptyStateRowSize,
  } = DATA_TABLE_CATEGORIES[category] as DataTableCategoryConfig
  const { table } = rowProps
  const { isLoading, error } = table
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
  const { emptyTitle, emptyMessage, emptyButton, emptySecondaryButton, errorTitle, errorMessage, onReload } =
    emptyState ?? {}

  return (
    <WithWrapper Wrapper={Box} shouldWrap={maxHeight} sx={{ maxHeight, overflowY: 'auto' }} ref={containerRef}>
      {/* Wrapper used to scroll back to the table without hiding it behind the sticky nav. */}
      <Box ref={tableTopRef} sx={{ scrollMarginTop: `${top}px` }}>
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
                  increasingLength={increasingLength}
                />
              ) : rows.length === 0 ? (
                <EmptyStateRow table={table} size={emptyStateRowSize}>
                  {error ? (
                    <ErrorMessage
                      title={errorTitle ?? t`Could not load data`}
                      subtitle={errorMessage ?? error.message}
                      error={error}
                      refreshData={onReload}
                      size={emptyStateSize}
                    />
                  ) : (
                    <EmptyStateCard
                      title={emptyTitle ?? t`No results found`}
                      description={emptyMessage ?? t`Try adjusting your filters or search query`}
                      button={emptyButton}
                      secondaryButton={emptySecondaryButton}
                      size={emptyStateSize}
                    />
                  )}
                </EmptyStateRow>
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
      </Box>
    </WithWrapper>
  )
}
