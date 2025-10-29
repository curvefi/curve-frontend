import { isEqual } from 'lodash'
import { useCallback, useMemo, useState } from 'react'
import { type NetworkConfig } from '@/dex/types/main.types'
import { ColumnFiltersState, ExpandedState, useReactTable } from '@tanstack/react-table'
import { CurveApi } from '@ui-kit/features/connect-wallet'
import { useUserProfileStore } from '@ui-kit/features/user-profile'
import { SMALL_POOL_TVL } from '@ui-kit/features/user-profile/store'
import { useIsTablet } from '@ui-kit/hooks/useBreakpoints'
import { useSortFromQueryString } from '@ui-kit/hooks/useSortFromQueryString'
import type { MigrationOptions } from '@ui-kit/hooks/useStoredState'
import { t } from '@ui-kit/lib/i18n'
import { getTableOptions } from '@ui-kit/shared/ui/DataTable/data-table.utils'
import { DataTable } from '@ui-kit/shared/ui/DataTable/DataTable'
import { EmptyStateRow } from '@ui-kit/shared/ui/DataTable/EmptyStateRow'
import { useColumnFilters } from '@ui-kit/shared/ui/DataTable/hooks/useColumnFilters'
import { TableFilters } from '@ui-kit/shared/ui/DataTable/TableFilters'
import { TableFiltersTitles } from '@ui-kit/shared/ui/DataTable/TableFiltersTitles'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import { PoolListChips } from './chips/PoolListChips'
import { POOL_LIST_COLUMNS, PoolColumnId } from './columns'
import { PoolListEmptyState } from './components/PoolListEmptyState'
import { PoolMobileExpandedPanel } from './components/PoolMobileExpandedPanel'
import { usePoolListData } from './hooks/usePoolListData'
import { DEFAULT_SORT, usePoolListVisibilitySettings } from './hooks/usePoolListVisibilitySettings'

const { Sizing } = SizesAndSpaces

const LOCAL_STORAGE_KEY = 'dex-pool-list'

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

export const PoolListTable = ({ network, curve }: { network: NetworkConfig; curve: CurveApi | null }) => {
  // todo: this needs to be more complicated, we need to show at least the top 10 per chain
  const minLiquidity = useUserProfileStore((s) => s.hideSmallPools) ? SMALL_POOL_TVL : 0
  const { isLite, poolFilters } = network
  const { signerAddress } = curve ?? {}

  // todo: use isReady to show a loading spinner close to the data
  const { data, isLoading, isReady, userHasPositions } = usePoolListData(network)

  const defaultFilters = useDefaultPoolsFilter(minLiquidity)
  const [columnFilters, columnFiltersById, setColumnFilter, resetFilters] = useColumnFilters(
    LOCAL_STORAGE_KEY,
    migration,
    defaultFilters,
  )
  const [sorting, onSortingChange] = useSortFromQueryString(DEFAULT_SORT)
  const { columnSettings, columnVisibility, toggleVisibility, sortField } = usePoolListVisibilitySettings(
    LOCAL_STORAGE_KEY,
    {
      isLite,
      sorting,
    },
  )
  const [expanded, onExpandedChange] = useState<ExpandedState>({})
  const [searchText, onSearch] = useSearch(columnFiltersById, setColumnFilter)

  const table = useReactTable({
    columns: POOL_LIST_COLUMNS,
    data: useMemo(() => data ?? [], [data]),
    state: { expanded, sorting, columnVisibility, columnFilters },
    onSortingChange,
    onExpandedChange,
    ...getTableOptions(data),
  })

  const resultCount = table.getFilteredRowModel().rows.length
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
        filterExpandedKey={LOCAL_STORAGE_KEY}
        leftChildren={<TableFiltersTitles title={t`Markets`} subtitle={t`Find your next opportunity`} />}
        loading={isLoading}
        // todo: onReload={onReload}
        visibilityGroups={columnSettings}
        // toggleVisibility={toggleVisibility} we don't have any optional columns yet
        searchText={searchText}
        onSearch={onSearch}
        hasSearchBar
        chips={
          <PoolListChips
            poolFilters={poolFilters}
            hiddenMarketCount={data ? data.length - resultCount : 0}
            hasFilters={columnFilters.length > 0 && !isEqual(columnFilters, defaultFilters)}
            resetFilters={resetFilters}
            onSortingChange={onSortingChange}
            sortField={sortField}
            searchText={searchText}
            onSearch={onSearch}
            columnFiltersById={columnFiltersById}
            setColumnFilter={setColumnFilter}
            resultCount={data ? resultCount : undefined}
          />
        }
      />
    </DataTable>
  )
}
