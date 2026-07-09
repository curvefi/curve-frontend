import { useCallback, useState } from 'react'
import { usePoolList } from '@/dex/queries/pool-list.query'
import type { NetworkConfig } from '@/dex/types/main.types'
import type { SortDirection as PoolSortDirection, V2PoolSortField as PoolSortField } from '@curvefi/prices-api/pools'
import CardHeader from '@mui/material/CardHeader'
import Stack from '@mui/material/Stack'
import { type ExpandedState, getCoreRowModel, getExpandedRowModel } from '@tanstack/react-table'
import { CURVE_SOCIALS } from '@ui/utils'
import { useIsMobile, useIsTablet } from '@ui-kit/hooks/useBreakpoints'
import { t } from '@ui-kit/lib/i18n'
import { useTable } from '@ui-kit/shared/ui/DataTable/data-table.utils'
import { DataTable } from '@ui-kit/shared/ui/DataTable/DataTable'
import { TableFilters } from '@ui-kit/shared/ui/DataTable/TableFilters'
import { useMappedQuery } from '@ui-kit/types/util'
import { POOL_LIST_COLUMNS, PoolListColumnId } from './columns'
import { PoolListFilterChips } from './components/PoolListFilterChips'
import {
  PoolListMobileExpandedPanel,
  PoolListMobileExpandedPanelFooter,
} from './components/PoolListMobileExpandedPanel'
import { PoolListFilterDrawer } from './drawers/PoolListFilterDrawer'
import { PoolListSortDrawer } from './drawers/PoolListSortDrawer'
import { usePoolListFilters } from './hooks/usePoolListFilters'
import { POOL_LIST_PAGE_SIZE, usePoolListPagination } from './hooks/usePoolListPagination'
import { usePoolListSorting } from './hooks/usePoolListSorting'
import { usePoolListUserHasPosition } from './hooks/usePoolListUserHasPosition'
import { usePoolListVisibilitySettings } from './hooks/usePoolListVisibilitySettings'
import type { PoolListPoolType } from './poolList.constants'
import { getPoolListItem } from './poolList.utils'

const LOCAL_STORAGE_KEY = 'dex-pool-list'

type PoolListTableParams = {
  network: NetworkConfig
  page: number
  searchText: string
  poolType: PoolListPoolType | undefined
  sortBy: PoolSortField
  sortDirection: PoolSortDirection
}

/** Fetches the current pool page and maps API rows into table rows. */
const usePoolListTable = ({ network, page, searchText, poolType, sortBy, sortDirection }: PoolListTableParams) => {
  const hasUserPoolPosition = usePoolListUserHasPosition(network.chainId)
  const poolListQuery = usePoolList({
    chainId: network.chainId,
    page,
    pageSize: POOL_LIST_PAGE_SIZE,
    searchString: searchText || undefined,
    poolType,
    sortBy,
    sortDirection,
  })
  const { data: poolList, isPlaceholderData } = poolListQuery
  const tableQuery = useMappedQuery(
    poolListQuery,
    useCallback(
      ({ pools }) => pools.map(pool => getPoolListItem(network, pool, hasUserPoolPosition(pool.address))),
      [hasUserPoolPosition, network],
    ),
  )

  return {
    apiResultCount: isPlaceholderData ? undefined : poolList?.count,
    pageCount: poolList?.pageCount ?? -1,
    userHasPositions: tableQuery.data?.some(({ hasPosition }) => hasPosition),
    tableQuery,
  }
}

export const PoolListTable = ({ network }: { network: NetworkConfig }) => {
  const isMobile = useIsMobile()
  const { onPaginationChange, pagination, updateQueryAndResetPage } = usePoolListPagination()
  const { activeFilterCount, onSearch, poolType, poolTypeFilters, resetFilters, searchText, setPoolType } =
    usePoolListFilters(updateQueryAndResetPage)
  const { onSortingChange, sortBy, sortDirection, sortField, sorting, sortOptions } = usePoolListSorting(
    network.isLite,
    updateQueryAndResetPage,
  )

  const [expanded, setExpanded] = useState<ExpandedState>({})
  const { columnSettings, columnVisibility, toggleVisibility } = usePoolListVisibilitySettings(LOCAL_STORAGE_KEY, {
    isLite: network.isLite,
    sorting,
  })
  const filterProps = { poolType, poolTypeFilters, setPoolType }

  const { apiResultCount, pageCount, userHasPositions, tableQuery } = usePoolListTable({
    network,
    page: pagination.pageIndex + 1,
    searchText,
    poolType,
    sortBy,
    sortDirection,
  })

  const table = useTable({
    columns: POOL_LIST_COLUMNS,
    query: tableQuery,
    state: { expanded, sorting, pagination, columnVisibility },
    onExpandedChange: setExpanded,
    onPaginationChange,
    onSortingChange,
    getCoreRowModel: getCoreRowModel(),
    getExpandedRowModel: getExpandedRowModel(),
    manualPagination: true,
    manualSorting: true,
    manualFiltering: true,
    pageCount,
    autoResetPageIndex: false,
  })

  return (
    <Stack>
      <CardHeader title={t`Pools`} />
      <DataTable
        table={table}
        emptyState={{
          title: t`Can't find what you're looking for?`,
          description: t`Try adjusting your filters or search query. Or feel free to ask us on Telegram.`,
          button: { label: t`Show all pools`, onClick: resetFilters },
          secondaryButton: { label: t`Telegram`, href: CURVE_SOCIALS.telegram.en },
        }}
        errorState={{ title: t`Unable to retrieve pool list` }}
        expandedPanel={{ Body: PoolListMobileExpandedPanel, Footer: PoolListMobileExpandedPanelFooter }}
        shouldStickFirstColumn={Boolean(useIsTablet() && userHasPositions)}
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
