import { useMemo, useState } from 'react'
import { usePoolList } from '@/dex/queries/pool-list.query'
import type { NetworkConfig } from '@/dex/types/main.types'
import CardHeader from '@mui/material/CardHeader'
import Stack from '@mui/material/Stack'
import { type ExpandedState, getCoreRowModel, getExpandedRowModel } from '@tanstack/react-table'
import { useIsMobile, useIsTablet } from '@ui-kit/hooks/useBreakpoints'
import { t } from '@ui-kit/lib/i18n'
import { useTable } from '@ui-kit/shared/ui/DataTable/data-table.utils'
import { DataTable } from '@ui-kit/shared/ui/DataTable/DataTable'
import { EmptyStateRow } from '@ui-kit/shared/ui/DataTable/EmptyStateRow'
import { TableFilters } from '@ui-kit/shared/ui/DataTable/TableFilters'
import { POOL_LIST_COLUMNS, PoolListColumnId } from './columns'
import { PoolListEmptyState } from './components/PoolListEmptyState'
import { PoolListFilterChips } from './components/PoolListFilterChips'
import { PoolListMobileExpandedPanel } from './components/PoolListMobileExpandedPanel'
import { PoolListFilterDrawer } from './drawers/PoolListFilterDrawer'
import { PoolListSortDrawer } from './drawers/PoolListSortDrawer'
import { POOL_LIST_PAGE_SIZE, usePoolListUrlState } from './hooks/usePoolListUrlState'
import { usePoolListUserPositionOptions } from './hooks/usePoolListUserPositionOptions'
import { usePoolListVisibilitySettings } from './hooks/usePoolListVisibilitySettings'
import { getPoolListItem } from './poolList.utils'

const LOCAL_STORAGE_KEY = 'dex-pool-list'
const EMPTY: never[] = []

export const PoolListTable = ({ network }: { network: NetworkConfig }) => {
  const isMobile = useIsMobile()
  const getUserPositionOptions = usePoolListUserPositionOptions(network.chainId)
  const {
    activeFilterCount,
    onSearch,
    onPaginationChange,
    onSortingChange,
    pagination,
    poolType,
    poolTypeFilters,
    resetFilters,
    searchText,
    setPoolType,
    sortBy,
    sortDirection,
    sortField,
    sorting,
    sortOptions,
  } = usePoolListUrlState(network)

  const {
    data: poolList,
    isPlaceholderData,
    isPending,
    isError,
  } = usePoolList({
    chainId: network.chainId,
    page: pagination.pageIndex + 1,
    pageSize: POOL_LIST_PAGE_SIZE,
    searchString: searchText || undefined,
    poolType,
    sortBy,
    sortDirection,
  })
  const loading = isPending
  const apiResultCount = isPlaceholderData ? undefined : poolList?.count
  const data = useMemo(
    () => poolList?.pools.map(pool => getPoolListItem(network, pool, getUserPositionOptions(pool.address))) ?? EMPTY,
    [getUserPositionOptions, network, poolList?.pools],
  )
  const userHasPositions = data.some(({ hasPosition }) => hasPosition)
  const [expanded, setExpanded] = useState<ExpandedState>({})
  const { columnSettings, columnVisibility, toggleVisibility } = usePoolListVisibilitySettings(LOCAL_STORAGE_KEY, {
    isLite: network.isLite,
    sorting,
  })
  const filterProps = { poolType, poolTypeFilters, setPoolType }

  const table = useTable({
    columns: POOL_LIST_COLUMNS,
    data,
    state: { expanded, sorting, pagination, columnVisibility },
    onExpandedChange: setExpanded,
    onPaginationChange,
    onSortingChange,
    getCoreRowModel: getCoreRowModel(),
    getExpandedRowModel: getExpandedRowModel(),
    manualPagination: true,
    manualSorting: true,
    manualFiltering: true,
    pageCount: poolList ? Math.ceil(poolList.count / POOL_LIST_PAGE_SIZE) : -1,
    autoResetPageIndex: false,
  })

  return (
    <Stack>
      <CardHeader title={t`Pools`} />
      <DataTable
        table={table}
        emptyState={
          <EmptyStateRow table={table}>
            <PoolListEmptyState
              poolType={poolType}
              poolTypeFilters={poolTypeFilters}
              resetFilters={resetFilters}
              searchText={searchText}
              isError={isError}
            />
          </EmptyStateRow>
        }
        expandedPanel={PoolListMobileExpandedPanel}
        shouldStickFirstColumn={Boolean(useIsTablet() && userHasPositions)}
        isLoading={loading}
      >
        <TableFilters<PoolListColumnId>
          testIdPrefix={LOCAL_STORAGE_KEY}
          visibilityGroups={columnSettings}
          toggleVisibility={toggleVisibility}
          searchText={searchText}
          onSearch={onSearch}
          filterChip={
            isMobile && (
              <PoolListFilterDrawer
                activeFilterCount={activeFilterCount}
                resetFilters={resetFilters}
                resultCount={apiResultCount}
                {...filterProps}
              />
            )
          }
          sortChip={
            isMobile && (
              <PoolListSortDrawer onSortingChange={onSortingChange} options={sortOptions} sortField={sortField} />
            )
          }
          chips={<PoolListFilterChips resultCount={apiResultCount} {...filterProps} />}
        />
      </DataTable>
    </Stack>
  )
}
