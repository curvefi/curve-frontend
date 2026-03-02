import { useState } from 'react'
import { type NetworkConfig } from '@/dex/types/main.types'
import { ExpandedState, getPaginationRowModel } from '@tanstack/react-table'
import { useIsTablet } from '@ui-kit/hooks/useBreakpoints'
import { usePageFromQueryString } from '@ui-kit/hooks/usePageFromQueryString'
import { useSortFromQueryString } from '@ui-kit/hooks/useSortFromQueryString'
import { t } from '@ui-kit/lib/i18n'
import { getTableOptions, useTable } from '@ui-kit/shared/ui/DataTable/data-table.utils'
import { DataTable } from '@ui-kit/shared/ui/DataTable/DataTable'
import { EmptyStateRow } from '@ui-kit/shared/ui/DataTable/EmptyStateRow'
import { useFilters } from '@ui-kit/shared/ui/DataTable/hooks/useFilters'
import { TableFilters } from '@ui-kit/shared/ui/DataTable/TableFilters'
import { TableFiltersTitles } from '@ui-kit/shared/ui/DataTable/TableFiltersTitles'
import { PoolListChips } from './chips/PoolListChips'
import { getDefaultSort } from './columns'
import { POOL_LIST_COLUMNS, PoolColumnId } from './columns'
import { PoolListEmptyState } from './components/PoolListEmptyState'
import { PoolMobileExpandedPanel } from './components/PoolMobileExpandedPanel'
import { usePoolListData } from './hooks/usePoolListData'
import { usePoolListVisibilitySettings } from './hooks/usePoolListVisibilitySettings'
import { usePoolsGlobalFilterFn } from './poolsGlobalFilter'

const LOCAL_STORAGE_KEY = 'dex-pool-list'

const PER_PAGE = 50
const EMPTY: never[] = []

export const PoolListTable = ({ network }: { network: NetworkConfig }) => {
  const { isLite, poolFilters } = network

  // todo: use isReady to show a loading spinner close to the data
  const { data, isLoading, isReady, userHasPositions } = usePoolListData(network)

  const { globalFilter, setGlobalFilter, columnFilters, columnFiltersById, setColumnFilter, hasFilters, resetFilters } =
    useFilters({
      columns: PoolColumnId,
    })
  const globalFilterFn = usePoolsGlobalFilterFn(data ?? [], globalFilter)
  const [sorting, onSortingChange] = useSortFromQueryString(getDefaultSort(isLite))
  const [pagination, onPaginationChange] = usePageFromQueryString(PER_PAGE)
  const { columnSettings, columnVisibility, sortField } = usePoolListVisibilitySettings(LOCAL_STORAGE_KEY, {
    isLite,
    sorting,
  })
  const [expanded, onExpandedChange] = useState<ExpandedState>({})
  const filterProps = { columnFiltersById, setColumnFilter, defaultFilters: EMPTY }

  const table = useTable({
    columns: POOL_LIST_COLUMNS,
    data: data ?? EMPTY,
    state: { expanded, sorting, columnVisibility, columnFilters, pagination, globalFilter },
    onSortingChange,
    onExpandedChange,
    onPaginationChange,
    globalFilterFn,
    ...getTableOptions(data),
    getPaginationRowModel: getPaginationRowModel(),
  })

  const resultCount = table.getFilteredRowModel().rows.length
  return (
    <DataTable
      table={table}
      emptyState={
        <EmptyStateRow table={table}>
          <PoolListEmptyState columnFiltersById={columnFiltersById} resetFilters={resetFilters} />
        </EmptyStateRow>
      }
      expandedPanel={PoolMobileExpandedPanel}
      shouldStickFirstColumn={Boolean(useIsTablet() && userHasPositions)}
      loading={isLoading}
    >
      <TableFilters<PoolColumnId>
        filterExpandedKey={LOCAL_STORAGE_KEY}
        leftChildren={<TableFiltersTitles title={t`Pools`} subtitle={t`Find your next opportunity`} />}
        loading={!isReady}
        visibilityGroups={columnSettings}
        searchText={globalFilter}
        onSearch={setGlobalFilter}
        hasSearchBar
        chips={
          <PoolListChips
            poolFilters={poolFilters}
            hiddenMarketCount={data ? data.length - resultCount : 0}
            hasFilters={hasFilters}
            resetFilters={resetFilters}
            onSortingChange={onSortingChange}
            sortField={sortField}
            searchText={globalFilter}
            onSearch={setGlobalFilter}
            resultCount={data ? resultCount : undefined}
            {...filterProps}
          />
        }
      />
    </DataTable>
  )
}
