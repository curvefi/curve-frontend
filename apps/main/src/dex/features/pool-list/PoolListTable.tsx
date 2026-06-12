import { useCallback, useMemo, useState } from 'react'
import { usePoolList } from '@/dex/queries/pool-list.query'
import { getLocalPoolsBlacklist } from '@/dex/queries/pools-blacklist.query'
import type { NetworkConfig } from '@/dex/types/main.types'
import type { V2PoolFilterType as PoolType, V2PoolSortField as PoolSortField } from '@curvefi/prices-api/pools'
import { recordEntries } from '@primitives/objects.utils'
import {
  type ExpandedState,
  type OnChangeFn,
  type SortingState,
  getCoreRowModel,
  getExpandedRowModel,
} from '@tanstack/react-table'
import { useSearchNavigate, useSearchParams } from '@ui-kit/hooks/router'
import { useIsTablet } from '@ui-kit/hooks/useBreakpoints'
import { usePageFromQueryString } from '@ui-kit/hooks/usePageFromQueryString'
import { useSortFromQueryString } from '@ui-kit/hooks/useSortFromQueryString'
import { t } from '@ui-kit/lib/i18n'
import { useTable } from '@ui-kit/shared/ui/DataTable/data-table.utils'
import { EmptyStateRow } from '@ui-kit/shared/ui/DataTable/EmptyStateRow'
import { LegacyDataTable } from '@ui-kit/shared/ui/DataTable/LegacyDataTable'
import { LegacyTableFilters } from '@ui-kit/shared/ui/DataTable/LegacyTableFilters'
import { LegacyTableFiltersTitles } from '@ui-kit/shared/ui/DataTable/LegacyTableFiltersTitles'
import { getPoolListItem, normalizeAddress } from './apiPoolList.utils'
import { PoolListChips } from './chips/PoolListChips'
import { POOL_LIST_COLUMNS, PoolColumnId, getDefaultSort } from './columns'
import { PoolListEmptyState } from './components/PoolListEmptyState'
import { PoolMobileExpandedPanel } from './components/PoolMobileExpandedPanel'
import { usePoolListApiUserPositionOptions } from './hooks/usePoolListApiUserPositionOptions'
import { usePoolListVisibilitySettings } from './hooks/usePoolListVisibilitySettings'

const LOCAL_STORAGE_KEY = 'dex-pool-list'
const PER_PAGE = 50
const EMPTY: never[] = []

// The API bundles crypto, factory_crypto, and twocrypto_ng pools under the "crypto" filter.
// Omitted "main" and "factory" from available filters.
const POOL_TYPE_FILTERS = [
  { key: 'stableswapng', label: t`Stable NG` },
  { key: 'crvusd', label: t`crvUSD` },
  { key: 'crypto', label: t`Twocrypto` },
  { key: 'factory_tricrypto', label: t`Tricrypto` },
] satisfies { key: PoolType; label: string }[]

type PoolTypeFilter = (typeof POOL_TYPE_FILTERS)[number]['key']
const POOL_TYPES = POOL_TYPE_FILTERS.map(({ key }) => key)
const POOL_TYPE_SET = new Set<string>(POOL_TYPES)
const CRYPTO_POOL_TYPE_ALIASES = new Set<string>(['factory_crypto', 'twocryptong'])
const POOL_TYPE_FILTER_GROUPS = [POOL_TYPE_FILTERS]

const API_SORT_COLUMNS = {
  [PoolColumnId.PoolName]: { sortBy: 'name', label: t`Pool` },
  [PoolColumnId.RewardsBase]: { sortBy: 'base_daily_apr', label: t`Base vAPY` },
  [PoolColumnId.Volume]: { sortBy: 'volume', label: t`Volume` },
  [PoolColumnId.Tvl]: { sortBy: 'tvl', label: t`Total Value Locked` },
} as const satisfies Partial<Record<PoolColumnId, { sortBy: PoolSortField; label: string }>>

type ApiSortColumn = keyof typeof API_SORT_COLUMNS
type ApiColumnSort = { id: ApiSortColumn; desc: boolean }
type ApiSorting = [ApiColumnSort]

const API_SORT_OPTIONS = recordEntries(API_SORT_COLUMNS).map(([id, { label }]) => ({ id, label }))

// Legacy rewards header exposes client-side CRV/Incentives sort controls that are not API sort fields.
const POOL_LIST_API_COLUMNS = POOL_LIST_COLUMNS.map(column =>
  column.id === PoolColumnId.RewardsOther ? { ...column, header: t`Rewards tAPR` } : column,
)

const isPoolType = (value: string | null): value is PoolTypeFilter => value != null && POOL_TYPE_SET.has(value)

const getPoolType = (value: string | null): PoolTypeFilter | undefined =>
  value != null && CRYPTO_POOL_TYPE_ALIASES.has(value) ? 'crypto' : isPoolType(value) ? value : undefined

const isApiSortColumn = (value: string | undefined): value is ApiSortColumn =>
  value != null && value in API_SORT_COLUMNS

const isApiColumnSort = (sort: SortingState[number]): sort is ApiColumnSort => isApiSortColumn(sort.id)

const getApiSorting = (sorting: SortingState, defaultSort: SortingState): ApiSorting => {
  const sort = sorting.find(isApiColumnSort) ?? defaultSort.find(isApiColumnSort)

  return sort ? [{ id: sort.id, desc: sort.desc }] : [{ id: PoolColumnId.Tvl, desc: true }]
}

const usePoolListApiUrlState = ({ isLite }: Pick<NetworkConfig, 'isLite'>) => {
  const searchParams = useSearchParams()
  const searchNavigate = useSearchNavigate(searchParams)
  const defaultSort = useMemo<SortingState>(() => getDefaultSort(isLite), [isLite])
  const [urlSorting] = useSortFromQueryString(defaultSort)
  const sorting = useMemo(() => getApiSorting(urlSorting, defaultSort), [defaultSort, urlSorting])
  const [{ id: sortField, desc }] = sorting
  const { sortBy } = API_SORT_COLUMNS[sortField]
  const sortDirection: 'desc' | 'asc' = desc ? 'desc' : 'asc'
  const [pagination, onPaginationChange] = usePageFromQueryString(PER_PAGE)
  const searchText = searchParams.get('search') ?? ''
  const poolTypeParam = searchParams.get(PoolColumnId.PoolTags)
  const poolType = getPoolType(poolTypeParam)

  const updateQueryAndResetPage = useCallback(
    (update: Record<string, string | string[] | null>) => searchNavigate({ ...update, page: null }, { replace: true }),
    [searchNavigate],
  )
  const setSearch = useCallback(
    (value: string) => updateQueryAndResetPage({ search: value || null }),
    [updateQueryAndResetPage],
  )
  const setPoolType = useCallback(
    (type: PoolTypeFilter | null) => updateQueryAndResetPage({ [PoolColumnId.PoolTags]: type }),
    [updateQueryAndResetPage],
  )
  const resetFilters = useCallback(
    () => updateQueryAndResetPage({ search: null, [PoolColumnId.PoolTags]: null }),
    [updateQueryAndResetPage],
  )
  const onSortingChange: OnChangeFn<SortingState> = useCallback(
    updater => {
      const nextSorting = typeof updater === 'function' ? updater(sorting) : updater
      const apiSorting = getApiSorting(nextSorting, defaultSort)
      updateQueryAndResetPage({ sort: apiSorting.map(({ id, desc }) => `${desc ? '-' : ''}${id}`) })
    },
    [defaultSort, sorting, updateQueryAndResetPage],
  )

  return {
    onPaginationChange,
    onSortingChange,
    pagination,
    poolType,
    resetFilters,
    searchText,
    setPoolType,
    setSearch,
    sortBy,
    sortDirection,
    sortField,
    sorting,
  }
}

export const PoolListTable = ({ network }: { network: NetworkConfig }) => {
  const isTablet = useIsTablet()
  const getUserPositionOptions = usePoolListApiUserPositionOptions(network.chainId)
  const {
    onPaginationChange,
    onSortingChange,
    pagination,
    poolType,
    resetFilters,
    searchText,
    setPoolType,
    setSearch,
    sortBy,
    sortDirection,
    sortField,
    sorting,
  } = usePoolListApiUrlState(network)

  const {
    data: poolList,
    isPlaceholderData,
    isPending,
    isError,
  } = usePoolList({
    chainId: network.chainId,
    page: pagination.pageIndex + 1,
    pagination: PER_PAGE,
    searchString: searchText || undefined,
    poolType,
    sortBy,
    sortDirection,
  })
  const loading = isPending || isPlaceholderData
  /**
   * the prices v2 pool-list endpoint already applies the getPoolFilters blacklist
   *  upstream so we only need to apply the local repo blacklist
   */
  const localBlacklist = useMemo(() => new Set(getLocalPoolsBlacklist(network.id).map(normalizeAddress)), [network.id])
  const pools = useMemo(
    () => poolList?.pools.filter(({ address }) => !localBlacklist.has(normalizeAddress(address))) ?? EMPTY,
    [localBlacklist, poolList?.pools],
  )
  const poolCount = isPlaceholderData ? undefined : poolList?.count
  const emptyStateFilters = useMemo(
    () => ({
      ...(searchText && { [PoolColumnId.PoolName]: searchText }),
      ...(poolType && { [PoolColumnId.PoolTags]: poolType }),
    }),
    [poolType, searchText],
  )
  const data = useMemo(
    () => pools.map(pool => getPoolListItem(network, pool, getUserPositionOptions(pool.address))),
    [getUserPositionOptions, network, pools],
  )
  const [expanded, setExpanded] = useState<ExpandedState>({})
  const { columnSettings, columnVisibility } = usePoolListVisibilitySettings(LOCAL_STORAGE_KEY, {
    isLite: network.isLite,
    sorting,
  })

  const table = useTable({
    columns: POOL_LIST_API_COLUMNS,
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
    pageCount: poolList ? Math.ceil(poolList.count / PER_PAGE) : -1,
    autoResetPageIndex: false,
  })

  return (
    <LegacyDataTable
      table={table}
      emptyState={
        <EmptyStateRow table={table}>
          <PoolListEmptyState columnFiltersById={emptyStateFilters} resetFilters={resetFilters} isError={isError} />
        </EmptyStateRow>
      }
      expandedPanel={PoolMobileExpandedPanel}
      shouldStickFirstColumn={isTablet}
      loading={loading}
    >
      <LegacyTableFilters<PoolColumnId>
        filterExpandedKey={LOCAL_STORAGE_KEY}
        leftChildren={<LegacyTableFiltersTitles title={t`Pools`} subtitle={t`Find your next opportunity`} />}
        loading={loading}
        visibilityGroups={columnSettings}
        searchText={searchText}
        onSearch={setSearch}
        hasSearchBar
        chips={
          <PoolListChips
            columnFiltersById={emptyStateFilters}
            filterGroups={POOL_TYPE_FILTER_GROUPS}
            hiddenCount={poolType ? 1 : 0}
            onSortingChange={onSortingChange}
            searchText={searchText}
            onSearch={setSearch}
            poolFilters={POOL_TYPES}
            resetFilters={resetFilters}
            resultCount={poolCount}
            setColumnFilter={(_, value) => setPoolType(isPoolType(value) ? value : null)}
            showHiddenCountReset={false} // "hidden" makes no sense unless returned from the API
            sortField={sortField}
            sortOptions={API_SORT_OPTIONS}
          />
        }
      />
    </LegacyDataTable>
  )
}
