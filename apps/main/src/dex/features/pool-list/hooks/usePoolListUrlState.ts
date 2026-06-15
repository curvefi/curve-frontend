import { useCallback, useMemo } from 'react'
import type { NetworkConfig } from '@/dex/types/main.types'
import type {
  SortDirection as PoolSortDirection,
  V2PoolFilterType as PoolType,
  V2PoolSortField as PoolSortField,
} from '@curvefi/prices-api/pools'
import { mapRecord, notFalsy, recordEntries, recordValues } from '@primitives/objects.utils'
import type { SortingState } from '@tanstack/react-table'
import { useSearchNavigate, useSearchParams } from '@ui-kit/hooks/router'
import { usePageFromQueryString } from '@ui-kit/hooks/usePageFromQueryString'
import { useSortFromQueryString } from '@ui-kit/hooks/useSortFromQueryString'
import { t } from '@ui-kit/lib/i18n'
import { POOL_LIST_TITLES, PoolListColumnId, getDefaultSort } from '../columns'

export const POOL_LIST_PAGE_SIZE = 50

const PAGE_QUERY_FIELD = 'page'
const POOL_TYPE_QUERY_FIELD = 'filter'
const SEARCH_QUERY_FIELD = 'search'

// The API bundles crypto, factory_crypto, and twocryptong pools under the "crypto" filter.
// Omitted "main" and "factory" from available filters.
export const POOL_TYPE_FILTERS = [
  { key: 'stableswapng', label: t`Stable NG` },
  { key: 'crvusd', label: t`crvUSD` },
  { key: 'crypto', label: t`Twocrypto` },
  { key: 'factory_tricrypto', label: t`Tricrypto` },
] satisfies { key: PoolType; label: string }[]

export type PoolListPoolType = (typeof POOL_TYPE_FILTERS)[number]['key']
export type PoolListFilter = (typeof POOL_TYPE_FILTERS)[number]

export const POOL_TYPES = POOL_TYPE_FILTERS.map(({ key }) => key)

const POOL_TYPE_SET = new Set<string>(POOL_TYPES)
const CRYPTO_POOL_TYPE_ALIASES = new Set<string>(['factory_crypto', 'twocryptong'])

export type PoolListSortableColumn =
  | PoolListColumnId.PoolName
  | PoolListColumnId.RewardsBase
  | PoolListColumnId.Volume
  | PoolListColumnId.Tvl

const SORT_COLUMNS = {
  [PoolListColumnId.PoolName]: { sortBy: 'name', label: POOL_LIST_TITLES[PoolListColumnId.PoolName] },
  [PoolListColumnId.RewardsBase]: { sortBy: 'base_daily_apr', label: POOL_LIST_TITLES[PoolListColumnId.RewardsBase] },
  [PoolListColumnId.Volume]: { sortBy: 'volume', label: POOL_LIST_TITLES[PoolListColumnId.Volume] },
  [PoolListColumnId.Tvl]: { sortBy: 'tvl', label: POOL_LIST_TITLES[PoolListColumnId.Tvl] },
} as const satisfies Record<PoolListSortableColumn, { sortBy: PoolSortField; label: string }>

type ColumnSort = { id: PoolListSortableColumn; desc: boolean }
type PoolListSorting = [ColumnSort]

export const SORT_OPTIONS = recordEntries(SORT_COLUMNS).map(([id, { label }]) => ({ id, label }))

const isPoolType = (value: string | null): value is PoolListPoolType => value != null && POOL_TYPE_SET.has(value)

const getPoolType = (value: string | null): PoolListPoolType | undefined =>
  value != null && CRYPTO_POOL_TYPE_ALIASES.has(value) ? 'crypto' : isPoolType(value) ? value : undefined

const isPoolListSortColumn = (value: string | undefined): value is PoolListSortableColumn =>
  value != null && value in SORT_COLUMNS

const isColumnSort = (sort: SortingState[number]): sort is ColumnSort => isPoolListSortColumn(sort.id)

const getPoolListSorting = (sorting: SortingState, defaultSort: SortingState): PoolListSorting => {
  const sort = sorting.find(isColumnSort) ?? defaultSort.find(isColumnSort)

  return sort ? [{ id: sort.id, desc: sort.desc }] : [{ id: PoolListColumnId.Tvl, desc: true }]
}

export const usePoolListUrlState = ({ isLite }: Pick<NetworkConfig, 'isLite'>) => {
  const searchParams = useSearchParams()
  const searchNavigate = useSearchNavigate(searchParams)
  const defaultSort = useMemo<SortingState>(() => getDefaultSort(isLite), [isLite])
  const normalizeSort = useCallback((sorting: SortingState) => getPoolListSorting(sorting, defaultSort), [defaultSort])
  const [urlSorting, onSortingChange] = useSortFromQueryString(defaultSort, {
    normalizeSort,
    resetPageField: PAGE_QUERY_FIELD,
  })
  const sorting = useMemo<PoolListSorting>(() => getPoolListSorting(urlSorting, defaultSort), [defaultSort, urlSorting])
  const [{ id: sortField, desc }] = sorting
  const { sortBy } = SORT_COLUMNS[sortField]
  const sortDirection: PoolSortDirection = desc ? 'desc' : 'asc'
  const [pagination, onPaginationChange] = usePageFromQueryString(POOL_LIST_PAGE_SIZE, PAGE_QUERY_FIELD)
  const searchText = searchParams.get(SEARCH_QUERY_FIELD) ?? ''
  const poolType = getPoolType(searchParams.get(POOL_TYPE_QUERY_FIELD))
  const activeFilters = useMemo(
    () => ({
      [SEARCH_QUERY_FIELD]: searchText,
      [POOL_TYPE_QUERY_FIELD]: poolType,
    }),
    [poolType, searchText],
  )
  const updateQueryAndResetPage = useCallback(
    (update: Record<string, string | string[] | null>) =>
      searchNavigate({ ...update, [PAGE_QUERY_FIELD]: null }, { replace: true }),
    [searchNavigate],
  )
  const setSearch = useCallback(
    (value: string) => updateQueryAndResetPage({ [SEARCH_QUERY_FIELD]: value || null }),
    [updateQueryAndResetPage],
  )
  const setPoolType = useCallback(
    (value: PoolListPoolType | null) => updateQueryAndResetPage({ [POOL_TYPE_QUERY_FIELD]: value }),
    [updateQueryAndResetPage],
  )
  const resetFilters = useCallback(
    () => updateQueryAndResetPage(mapRecord(activeFilters, () => null)),
    [activeFilters, updateQueryAndResetPage],
  )
  const activeFilterCount = notFalsy(...recordValues(activeFilters)).length

  return {
    activeFilterCount,
    onPaginationChange,
    onSearch: setSearch,
    onSortingChange,
    pagination,
    poolType,
    poolTypeFilters: POOL_TYPE_FILTERS,
    resetFilters,
    searchText,
    setPoolType,
    sortBy,
    sortDirection,
    sortField,
    sorting,
    sortOptions: SORT_OPTIONS,
  }
}
