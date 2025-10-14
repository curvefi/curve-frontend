import { isEqual } from 'lodash'
import { useCallback, useMemo, useState } from 'react'
import { useNetworkByChain } from '@/dex/entities/networks'
import { ChainId } from '@/dex/types/main.types'
import { ColumnFiltersState, ExpandedState, useReactTable } from '@tanstack/react-table'
import { CurveApi } from '@ui-kit/features/connect-wallet'
import { useUserProfileStore } from '@ui-kit/features/user-profile'
import { SMALL_POOL_TVL } from '@ui-kit/features/user-profile/store'
import { useIsMobile, useIsTablet } from '@ui-kit/hooks/useBreakpoints'
import { useSortFromQueryString } from '@ui-kit/hooks/useSortFromQueryString'
import type { MigrationOptions } from '@ui-kit/hooks/useStoredState'
import { FilterChips } from '@ui-kit/shared/ui/DataTable/chips/FilterChips'
import { getTableOptions } from '@ui-kit/shared/ui/DataTable/data-table.utils'
import { DataTable } from '@ui-kit/shared/ui/DataTable/DataTable'
import { EmptyStateRow } from '@ui-kit/shared/ui/DataTable/EmptyStateRow'
import { useColumnFilters } from '@ui-kit/shared/ui/DataTable/hooks/useColumnFilters'
import { TableFilters } from '@ui-kit/shared/ui/DataTable/TableFilters'
import { TableSearchField } from '@ui-kit/shared/ui/DataTable/TableSearchField'
import { POOL_LIST_COLUMNS, PoolColumnId } from './columns'
import { PoolListEmptyState } from './components/PoolListEmptyState'
import { PoolListFilterChips } from './components/PoolListFilterChips'
import { PoolListSort } from './components/PoolListSort'
import { PoolMobileExpandedPanel } from './components/PoolMobileExpandedPanel'
import { usePoolListData } from './hooks/usePoolListData'
import { DEFAULT_SORT, usePoolListVisibilitySettings } from './hooks/usePoolListVisibilitySettings'

const TITLE = 'Pools'

const migration: MigrationOptions<ColumnFiltersState> = { version: 1 }

const useDefaultPoolsFilter = (minLiquidity: number) =>
  useMemo(
    () => [
      {
        id: PoolColumnId.Tvl,
        value: [minLiquidity, null],
      },
    ],
    [minLiquidity],
  )

const useSearch = (columnFiltersById: Record<string, unknown>, setColumnFilter: (id: string, value: unknown) => void) =>
  [
    (columnFiltersById[PoolColumnId.PoolName] as string) ?? '',
    useCallback((search: string) => setColumnFilter(PoolColumnId.PoolName, search || undefined), [setColumnFilter]),
  ] as const

export const PoolListTable = ({ chainId, curve }: { chainId: ChainId; curve: CurveApi | null }) => {
  // todo: this needs to be more complicated, we need to show at least the top 10 per chain
  const minLiquidity = useUserProfileStore((s) => s.hideSmallPools) ? SMALL_POOL_TVL : 0
  const { data: network } = useNetworkByChain({ chainId })
  const { isCrvRewardsEnabled, isLite } = network
  const { signerAddress } = curve ?? {}

  // todo: use isReady to show a loading spinner close to the data
  const { data, isLoading, isReady, userHasPositions } = usePoolListData(network)

  const defaultFilters = useDefaultPoolsFilter(minLiquidity)
  const [columnFilters, columnFiltersById, setColumnFilter, resetFilters] = useColumnFilters(
    TITLE,
    migration,
    defaultFilters,
  )
  const [sorting, onSortingChange] = useSortFromQueryString(DEFAULT_SORT)
  const { columnSettings, columnVisibility, toggleVisibility, sortField } = usePoolListVisibilitySettings(TITLE, {
    isLite,
    isCrvRewardsEnabled,
    sorting,
  })
  const [expanded, onExpandedChange] = useState<ExpandedState>({})
  const [searchText, onSearch] = useSearch(columnFiltersById, setColumnFilter)
  const isMobile = useIsMobile()
  const filterProps = { columnFiltersById, setColumnFilter }

  const table = useReactTable({
    columns: POOL_LIST_COLUMNS,
    data: useMemo(() => data ?? [], [data]),
    state: { expanded, sorting, columnVisibility, columnFilters },
    onSortingChange,
    onExpandedChange,
    ...getTableOptions(data),
  })

  return (
    <DataTable
      lazy
      table={table}
      emptyState={
        <EmptyStateRow table={table}>
          <PoolListEmptyState
            columnFiltersById={columnFiltersById}
            signerAddress={signerAddress}
            resetFilters={resetFilters}
          />
        </EmptyStateRow>
      }
      expandedPanel={PoolMobileExpandedPanel}
      shouldStickFirstColumn={Boolean(useIsTablet() && userHasPositions)}
      loading={isLoading}
    >
      <TableFilters<PoolColumnId>
        title={TITLE}
        loading={isLoading}
        // todo: onReload={onReload}
        visibilityGroups={columnSettings}
        toggleVisibility={toggleVisibility}
        searchText={searchText}
        onSearch={onSearch}
        chips={
          <FilterChips
            hiddenMarketCount={data ? data.length - table.getFilteredRowModel().rows.length : 0}
            hasFilters={columnFilters.length > 0 && !isEqual(columnFilters, defaultFilters)}
            resetFilters={resetFilters}
          >
            {!isMobile && <TableSearchField value={searchText} onChange={onSearch} />}
            <PoolListFilterChips {...filterProps} />
          </FilterChips>
        }
        sort={<PoolListSort onSortingChange={onSortingChange} sortField={sortField} />}
      />
    </DataTable>
  )
}
