/// <reference types="./DataTable.d.ts" />
import { type ReactNode, useMemo, useRef } from 'react'
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
import { t } from '@ui-kit/lib/i18n'
import { TablePagination } from '@ui-kit/shared/ui/DataTable/TablePagination'
import { WithWrapper } from '@ui-kit/shared/ui/WithWrapper'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import { EmptyStateCard, EmptyStateCardProps } from '../EmptyStateCard'
import { ErrorMessage } from '../ErrorMessage'
import {
  DATA_TABLE_CATEGORIES,
  DataTableCategory,
  DataTableCategoryConfig,
  DataTableHeaderHeight,
  type TableItem,
  type TanstackTable,
} from './data-table.utils'
import { DataRow, type DataRowProps } from './DataRow'
import { EmptyStateRow } from './EmptyStateRow'
import { FilterRow } from './FilterRow'
import { HeaderCell } from './HeaderCell'
import { useResetPageOnResultChange } from './hooks/useResetPageOnResultChange'
import { useScrollToTopOnFilterChange, useScrollToTopOnPageChange } from './hooks/useTableScroll'
import { useTableStickyHeader } from './hooks/useTableStickyHeader'
import { SkeletonRows } from './SkeletonRows'
import { TableViewAllCell } from './TableViewAllCell'
import { useTableRowLimit } from './useTableRowLimit'

const TABLE_FILTERS_TEST_ID = 'table-filters'

const { Height } = SizesAndSpaces

type TableEmptyState = {
  testId?: string
} & Pick<EmptyStateCardProps, 'title' | 'description' | 'button' | 'secondaryButton'>
type TableErrorState = { onReload?: () => Promise<unknown> | void } & Pick<EmptyStateCardProps, 'title' | 'description'>

export type DataTableProps<T extends TableItem> = {
  category?: DataTableCategory
  table: TanstackTable<T>
  emptyState?: TableEmptyState // optional overrides for the built-in empty state
  errorState?: TableErrorState // optional overrides for the built-in error state
  children?: ReactNode // passed to <FilterRow />
  footerRow?: ReactNode
  viewAllLabel?: string // button's label to expand all rows. defaultVisibleRows must be first set
} & Omit<DataRowProps<T>, 'table' | 'row'>

/**
 * DataTable component to render the table with headers and rows.
 * The table header stays sticky only when enabled, rows are not limited, and table content fits within its parent.
 * When the table is wider than its parent, the header stops being sticky and the table becomes horizontally scrollable.
 */
export const DataTable = <T extends TableItem>({
  category = 'list',
  emptyState,
  errorState,
  children,
  shouldStickFirstColumn = false,
  footerRow,
  viewAllLabel,
  ...rowProps
}: DataTableProps<T>) => {
  const {
    size = 'small',
    height,
    defaultVisibleRows: rowLimit,
    disableStickyHeader = false,
    hideHeader = false,
    increasingLength = 'default',
    emptyStateSize = 'md',
    emptyStateRowSize = 'sm',
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
      top: height ? 0 : top,
      zIndex: t.zIndex.tableHeader,
      marginBlockEnd: Height.row, // last row should not be hidden by the sticky header
    }),
  })
  const showFooter = !isLoading && (showPagination || showViewAllButton || footerRow)

  return (
    <WithWrapper Wrapper={Box} shouldWrap={height} sx={{ height, overflowY: 'auto' }} ref={containerRef}>
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
                      title={errorState?.title ?? t`Could not load data`}
                      subtitle={errorState?.description ?? error.message}
                      error={error}
                      refreshData={errorState?.onReload}
                      size={emptyStateSize}
                    />
                  ) : (
                    <EmptyStateCard
                      title={emptyState?.title ?? t`No results found`}
                      description={emptyState?.description}
                      button={emptyState?.button}
                      secondaryButton={emptyState?.secondaryButton}
                      size={emptyStateSize}
                      testId={emptyState?.testId}
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
