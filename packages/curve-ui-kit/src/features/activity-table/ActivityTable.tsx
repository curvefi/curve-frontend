import { SetStateAction, useCallback, useMemo, useState } from 'react'
import { Box } from '@mui/material'
import type { Row, Table, PaginationState } from '@tanstack/react-table'
import { SortingState } from '@tanstack/react-table'
import { t } from '@ui-kit/lib/i18n'
import { getTableOptions, useTable, type TableItem } from '@ui-kit/shared/ui/DataTable/data-table.utils'
import { DataTable } from '@ui-kit/shared/ui/DataTable/DataTable'
import { EmptyStateRow } from '@ui-kit/shared/ui/DataTable/EmptyStateRow'
import { ErrorMessage } from '@ui-kit/shared/ui/ErrorMessage'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import type { ActivityTableProps } from './types'

const { MaxHeight } = SizesAndSpaces

const DEFAULT_PAGE_SIZE = 50

/** Default expanded panel that renders nothing (for tables without mobile expansion) */
const DefaultExpandedPanel = <T extends TableItem>(_props: { row: Row<T>; table: Table<T> }) => null

/**
 * A generic activity table component with toggle buttons for switching between different data views.
 * Designed to work with various data sources like llamma events/trades or pool trades/liquidity.
 */
export const ActivityTable = <TData extends TableItem>({
  tableConfig,
  height = MaxHeight.userEventsTable,
  expandedPanel,
}: ActivityTableProps<TData>) => {
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
    (updater: SetStateAction<PaginationState>) =>
      onPageChange?.((typeof updater === 'function' ? updater(pagination) : updater).pageIndex),
    [onPageChange, pagination],
  )

  const table = useTable({
    data,
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

  const errorMessage = isError ? (emptyMessage ?? t`Could not load data`) : (emptyMessage ?? t`No data found`)

  return (
    <Box minHeight={height}>
      <DataTable
        table={table}
        emptyState={
          <EmptyStateRow table={table} size="lg">
            <ErrorMessage
              title={t`Hm... Something went wrong.`}
              subtitle={errorMessage}
              errorMessage={t`Couldn't load activity table data`}
            />
          </EmptyStateRow>
        }
        loading={isLoading}
        maxHeight={height}
        shouldStickFirstColumn={false}
        expandedPanel={expandedPanel ?? DefaultExpandedPanel}
      />
    </Box>
  )
}
