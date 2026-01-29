import { useCallback, useMemo, useState } from 'react'
import Stack from '@mui/material/Stack'
import type { Row, Table, PaginationState } from '@tanstack/react-table'
import { SortingState } from '@tanstack/react-table'
import { t } from '@ui-kit/lib/i18n'
import { getTableOptions, useTable, type TableItem } from '@ui-kit/shared/ui/DataTable/data-table.utils'
import { DataTable } from '@ui-kit/shared/ui/DataTable/DataTable'
import { EmptyStateRow } from '@ui-kit/shared/ui/DataTable/EmptyStateRow'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import { ActivityTableHeader } from './ActivityTableHeader'
import type { ActivityTableProps } from './types'

const { Spacing, MaxHeight } = SizesAndSpaces

const DEFAULT_PAGE_SIZE = 50

/** Default expanded panel that renders nothing (for tables without mobile expansion) */
const DefaultExpandedPanel = <T extends TableItem>(_props: { row: Row<T>; table: Table<T> }) => null

/**
 * A generic activity table component with toggle buttons for switching between different data views.
 * Designed to work with various data sources like llamma events/trades or pool trades/liquidity.
 */
export const ActivityTable = <TKey extends string, TData extends TableItem>({
  selections,
  activeSelection,
  onSelectionChange,
  tableConfig,
  maxHeight = MaxHeight.userEventsTable,
  expandedPanel,
}: ActivityTableProps<TKey, TData>) => {
  const {
    data,
    columns,
    isLoading,
    isError,
    emptyMessage,
    columnVisibility,
    pageIndex: controlledPageIndex,
    pageSize = DEFAULT_PAGE_SIZE,
    pageCount,
    onPageChange,
  } = tableConfig

  const [sorting, setSorting] = useState<SortingState>([])

  const pagination: PaginationState = useMemo(
    () => ({
      pageIndex: controlledPageIndex ?? 0,
      pageSize,
    }),
    [controlledPageIndex, pageSize],
  )

  const handlePaginationChange = useCallback(
    (updater: PaginationState | ((old: PaginationState) => PaginationState)) => {
      if (onPageChange) {
        const newState = typeof updater === 'function' ? updater(pagination) : updater
        onPageChange(newState.pageIndex)
      }
    },
    [onPageChange, pagination],
  )

  const table = useTable({
    data: data ?? [],
    columns,
    state: {
      sorting,
      columnVisibility,
      ...(onPageChange && { pagination }),
    },
    initialState: { pagination: { pageIndex: 0, pageSize } },
    onSortingChange: setSorting,
    ...(onPageChange && {
      manualPagination: true,
      pageCount,
      onPaginationChange: handlePaginationChange,
    }),
    ...getTableOptions(data),
  })

  return (
    <Stack gap={Spacing.xs}>
      <ActivityTableHeader
        selections={selections}
        activeSelection={activeSelection}
        onSelectionChange={onSelectionChange}
      />
      <DataTable
        table={table}
        emptyState={
          <EmptyStateRow table={table} size="lg">
            {isError ? (emptyMessage ?? t`Could not load data`) : (emptyMessage ?? t`No data found`)}
          </EmptyStateRow>
        }
        loading={isLoading}
        maxHeight={maxHeight}
        shouldStickFirstColumn={false}
        expandedPanel={expandedPanel ?? DefaultExpandedPanel}
        skeletonMatchPageSize
      />
    </Stack>
  )
}
