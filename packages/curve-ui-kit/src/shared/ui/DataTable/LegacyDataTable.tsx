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
import { t } from '@ui-kit/lib/i18n'
import { TablePagination } from '@ui-kit/shared/ui/DataTable/TablePagination'
import { WithWrapper } from '@ui-kit/shared/ui/WithWrapper'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import { DataTableHeaderHeight, type DataTableSize, type TableItem, type TanstackTable } from './data-table.utils'
import { HeaderCell } from './HeaderCell'
import { useScrollToTopOnFilterChange, useScrollToTopOnPageChange } from './hooks/useTableScroll'
import { LegacyDataRow, LegacyDataRowProps } from './LegacyDataRow'
import { LegacyFilterRow } from './LegacyFilterRow'
import { SkeletonRows } from './SkeletonRows'
import { TableViewAllCell } from './TableViewAllCell'
import { useTableRowLimit } from './useTableRowLimit'

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
export const LegacyDataTable = <T extends TableItem>({
  emptyState,
  children,
  loading,
  size = 'large',
  maxHeight,
  rowLimit,
  viewAllLabel,
  disableStickyHeader,
  shouldStickFirstColumn = false,
  hideHeader = false,
  footerRow,
  ...rowProps
}: {
  table: TanstackTable<T>
  emptyState: ReactNode
  children?: ReactNode // passed to <FilterRow />
  loading: boolean
  size?: DataTableSize
  maxHeight?: `${number}rem` // also sets overflowY to 'auto'
  rowLimit?: number
  viewAllLabel?: string
  disableStickyHeader?: boolean
  hideHeader?: boolean
  footerRow?: ReactNode
} & Omit<LegacyDataRowProps<T>, 'row' | 'isLastRow' | 'shouldStickLastRowToTop'>) => {
  const { table } = rowProps
  const { rows } = table.getRowModel()
  const { isLimited, isLoading: isLoadingViewAll, onShowAll } = useTableRowLimit(rowLimit, rows.length)
  // When number of rows are limited, show only rowLimit rows
  const visibleRows = isLimited && rowLimit ? rows.slice(0, rowLimit) : rows
  const showViewAllButton = isLimited && rows.length > rowLimit!
  // pagination should bw shown if no rows limit and if needed
  const showPagination = !isLimited && table.getPageCount() > 1

  const headerGroups = table.getHeaderGroups()
  const columnCount = useMemo(() => headerGroups.reduce((acc, group) => acc + group.headers.length, 0), [headerGroups])
  const top = useLayoutStore(state => state.navHeight)
  const tableTopRef = useRef<HTMLTableElement>(null)
  useScrollToTopOnFilterChange({ table, tableTopRef })
  useResetPageOnResultChange(table)
  useScrollToTopOnPageChange({ table, tableTopRef })
  const tableHeaderSx = (t: Theme) => ({
    ...(!disableStickyHeader && {
      position: 'sticky',
      top: maxHeight ? 0 : top,
      zIndex: t.zIndex.tableHeader,
    }),
    backgroundColor: t.design.Table.Header.Fill,
    marginBlock: Sizing.sm,
  })
  const shouldStickLastRowToTop = !disableStickyHeader && !hideHeader
  const showFooter = showPagination || showViewAllButton || footerRow

  return (
    <WithWrapper Wrapper={Box} shouldWrap={maxHeight} sx={{ maxHeight, overflowY: 'auto' }}>
      <Table
        ref={tableTopRef}
        sx={{
          backgroundColor: t => t.design.Layer[1].Fill,
          borderCollapse: 'separate' /* Don't collapse to avoid funky stuff with the sticky header */,
          // Prevent a long content of a column to push the other column outside the viewport
          ...(useIsMobile() && { tableLayout: 'fixed' }),
          // affects where the scrollIntoView stops, avoiding to be covered by the sticky nav
          scrollMarginTop: `${top}px`,
        }}
        data-testid={!loading && 'data-table'}
      >
        {!hideHeader && (
          <TableHead sx={tableHeaderSx} data-testid="data-table-head">
            {children && <LegacyFilterRow table={table}>{children}</LegacyFilterRow>}

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
          {loading ? (
            <SkeletonRows table={table} shouldStickFirstColumn={shouldStickFirstColumn} />
          ) : rows.length === 0 ? (
            emptyState
          ) : (
            visibleRows.map((row, index) => (
              <LegacyDataRow<T>
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
            {footerRow && <TableRow sx={{ verticalAlign: rowProps.verticalAlign }}>{footerRow}</TableRow>}
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
