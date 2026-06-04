import { countBy, sumBy } from 'lodash'
import { useCallback, useMemo, useState } from 'react'
import { usePoolList } from '@/dex/queries/pool-list.query'
import type { NetworkConfig, PoolData, RewardsApy } from '@/dex/types/main.types'
import { getPath } from '@/dex/utils/utilsRouter'
import type { PoolType, V2Pool, V2PoolSortField as PoolSortField } from '@curvefi/prices-api/pools'
import {
  type ExpandedState,
  type OnChangeFn,
  type PaginationState,
  type SortingState,
  getCoreRowModel,
  getExpandedRowModel,
} from '@tanstack/react-table'
import { useSearchNavigate, useSearchParams } from '@ui-kit/hooks/router'
import { useIsTablet } from '@ui-kit/hooks/useBreakpoints'
import { usePageFromQueryString } from '@ui-kit/hooks/usePageFromQueryString'
import { useSortFromQueryString } from '@ui-kit/hooks/useSortFromQueryString'
import { t } from '@ui-kit/lib/i18n'
import { DEX_ROUTES } from '@ui-kit/shared/routes'
import { useTable } from '@ui-kit/shared/ui/DataTable/data-table.utils'
import { EmptyStateRow } from '@ui-kit/shared/ui/DataTable/EmptyStateRow'
import { LegacyDataTable } from '@ui-kit/shared/ui/DataTable/LegacyDataTable'
import { LegacyTableFilters } from '@ui-kit/shared/ui/DataTable/LegacyTableFilters'
import { LegacyTableFiltersTitles } from '@ui-kit/shared/ui/DataTable/LegacyTableFiltersTitles'
import { decimal } from '@ui-kit/utils'
import { PoolListChips } from './chips/PoolListChips'
import { POOL_LIST_COLUMNS, PoolColumnId, getDefaultSort } from './columns'
import { PoolListEmptyState } from './components/PoolListEmptyState'
import { PoolMobileExpandedPanel } from './components/PoolMobileExpandedPanel'
import { usePoolListVisibilitySettings } from './hooks/usePoolListVisibilitySettings'
import type { PoolListItem } from './types'

const LOCAL_STORAGE_KEY = 'dex-pool-list'
const PER_PAGE = 50
const EMPTY: never[] = []

// Omitted "main", "factory", "factory_crypto", and "crypto" from available filters
const POOL_TYPE_FILTERS = [
  { key: 'stableswapng', label: t`Stable NG` },
  { key: 'crvusd', label: t`crvUSD` },
  { key: 'twocryptong', label: t`Twocrypto` },
  { key: 'factory_tricrypto', label: t`Tricrypto` },
] satisfies { key: PoolType; label: string }[]

type PoolTypeFilter = (typeof POOL_TYPE_FILTERS)[number]['key']
const POOL_TYPES = POOL_TYPE_FILTERS.map(({ key }) => key)
const POOL_TYPE_FILTER_GROUPS = [POOL_TYPE_FILTERS]

const API_SORT_FIELDS = {
  [PoolColumnId.PoolName]: 'name',
  [PoolColumnId.RewardsBase]: 'base_daily_apr',
  [PoolColumnId.Volume]: 'volume',
  [PoolColumnId.Tvl]: 'tvl',
} as const satisfies Partial<Record<PoolColumnId, PoolSortField>>

const API_SORT_OPTIONS = [
  { id: PoolColumnId.PoolName, label: t`Pool` },
  { id: PoolColumnId.RewardsBase, label: t`Base vAPY` },
  { id: PoolColumnId.Volume, label: t`Volume` },
  { id: PoolColumnId.Tvl, label: t`Total Value Locked` },
] as const satisfies readonly { id: PoolColumnId; label: string }[]

// Legacy rewards header exposes client-side CRV/Incentives sort controls that are not API sort fields.
const POOL_LIST_API_COLUMNS = POOL_LIST_COLUMNS.map(column =>
  column.id === PoolColumnId.RewardsOther ? { ...column, header: t`Rewards tAPR` } : column,
)

const VYPER_EXPLOIT_VERSIONS = new Set(['0.2.15', '0.2.16', '0.3.0'])

const isPoolType = (value: string | null): value is PoolTypeFilter =>
  value != null && POOL_TYPES.includes(value as PoolTypeFilter)

const isApiSortColumn = (value: string | undefined): value is keyof typeof API_SORT_FIELDS =>
  value != null && value in API_SORT_FIELDS

const getApiSorting = (sorting: SortingState, defaultSort: SortingState): SortingState => {
  const sort = sorting.find(({ id }) => isApiSortColumn(id)) ?? defaultSort.find(({ id }) => isApiSortColumn(id))

  return sort ? [{ id: sort.id, desc: sort.desc }] : [{ id: PoolColumnId.Tvl, desc: true }]
}

const normalizeAddress = (address: string) => address.toLowerCase()

const getPoolRewards = (pool: V2Pool): RewardsApy => {
  const poolAddress = normalizeAddress(pool.address)
  const gaugeAddress = pool.gauge?.address ? normalizeAddress(pool.gauge.address) : ''

  return {
    poolId: poolAddress,
    base: {
      day: `${pool.baseDailyApr ?? 0}`,
      week: `${pool.baseWeeklyApr ?? 0}`,
    },
    crv: [pool.crvApr ?? 0, pool.crvAprBoosted ?? 0],
    other: pool.extraRewardsApr
      .filter(({ apr }) => apr > 0)
      .map((reward, index) => ({
        apy: reward.apr,
        decimals: reward.decimals ?? undefined,
        gaugeAddress,
        name: reward.name ?? undefined,
        symbol: reward.symbol ?? '',
        tokenAddress: reward.address ? normalizeAddress(reward.address) : `${poolAddress}-${index}`,
        tokenPrice: reward.price ?? undefined,
      })),
    error: {},
  }
}

const getPoolListItem = (network: NetworkConfig, pool: V2Pool): PoolListItem => {
  const poolAddress = normalizeAddress(pool.address)
  const gaugeAddress = pool.gauge?.address ? normalizeAddress(pool.gauge.address) : ''
  const tokens = pool.coins.map(({ symbol }) => symbol)
  const tokenAddresses = pool.coins.map(({ address }) => normalizeAddress(address))
  const tokenDecimals = pool.coins.map(({ decimals }) => decimals ?? 18)
  const rewards = getPoolRewards(pool)
  const crvApr = pool.crvAprBoosted ?? pool.crvApr ?? 0
  const incentivesApr = sumBy(rewards.other, 'apy')

  return {
    chainId: network.chainId,
    pool: {
      id: poolAddress,
      name: pool.name,
      address: poolAddress,
      gauge: { address: gaugeAddress },
      lpToken: '', // not used in the new list
      isCrypto: false, // not used in the new list
      isNg: false, // not used in the new list
      isFactory: false, // not used in the new list
      isLending: false, // not used in the new list
      implementation: '', // not used in the new list
      referenceAsset: '', // not used in the new list
    } as PoolData['pool'],
    gauge: {
      isKilled: pool.gauge?.isKilled ?? null,
      status: null, // not used in the new list
    },
    hasWrapped: false, // not used in the new list
    hasVyperVulnerability: pool.vyperVersion != null && VYPER_EXPLOIT_VERSIONS.has(pool.vyperVersion),
    isWrapped: false, // not used in the new list
    tokenAddresses,
    tokenAddressesAll: tokenAddresses,
    tokenDecimalsAll: tokenDecimals,
    tokens,
    tokensCountBy: countBy(tokens),
    tokensAll: tokens,
    tokensLowercase: tokens.map(token => token.toLowerCase()),
    curvefiUrl: '', // not used in the new list
    failedFetching24hOldVprice: false, // not used in the new list
    rewards,
    volume: decimal(pool.tradingVolume24h),
    tvl: decimal(pool.tvlUsd),
    hasPosition: undefined, // in the old list balances are mapped with pool ids, the new API doesn't return them but we should get pool addresses to map with from curve-js
    network: network.id,
    url: getPath({ network: network.id }, `${DEX_ROUTES.PAGE_POOLS}/${poolAddress}/deposit`),
    tags: [], // not used in the new list
    totalAPR: crvApr + incentivesApr,
  }
}

export const PoolListApiTable = ({ network }: { network: NetworkConfig }) => {
  const isTablet = useIsTablet()
  const searchParams = useSearchParams()
  const searchNavigate = useSearchNavigate(searchParams)
  const defaultSort = useMemo<SortingState>(() => getDefaultSort(network.isLite), [network.isLite])
  const [urlSorting] = useSortFromQueryString(defaultSort)
  const sorting = useMemo(() => getApiSorting(urlSorting, defaultSort), [defaultSort, urlSorting])
  const sortColumn = sorting[0].id as keyof typeof API_SORT_FIELDS
  const sortField = sortColumn as PoolColumnId
  const sortBy = API_SORT_FIELDS[sortColumn]
  const sortDirection = sorting[0].desc ? 'desc' : 'asc'
  const [urlPagination, setUrlPagination] = usePageFromQueryString(PER_PAGE)
  const pagination = useMemo(
    () => ({
      pageIndex: Number.isFinite(urlPagination.pageIndex) ? Math.max(urlPagination.pageIndex, 0) : 0,
      pageSize: urlPagination.pageSize,
    }),
    [urlPagination.pageIndex, urlPagination.pageSize],
  )
  const searchText = searchParams.get('search') ?? ''
  const poolTypeParam = searchParams.get('pool_type')
  const poolType = isPoolType(poolTypeParam) ? poolTypeParam : undefined

  const setSearch = useCallback(
    (value: string) => searchNavigate({ search: value || null, page: null }, { replace: true }),
    [searchNavigate],
  )
  const setPoolType = useCallback(
    (type: PoolTypeFilter | null) => searchNavigate({ pool_type: type, page: null }, { replace: true }),
    [searchNavigate],
  )
  const resetFilters = useCallback(
    () => searchNavigate({ search: null, pool_type: null, page: null }, { replace: true }),
    [searchNavigate],
  )
  const onSortingChange: OnChangeFn<SortingState> = useCallback(
    updater => {
      const nextSorting = typeof updater === 'function' ? updater(sorting) : updater
      const apiSorting = getApiSorting(nextSorting, defaultSort)
      searchNavigate(
        { sort: apiSorting.map(({ id, desc }) => `${desc ? '-' : ''}${id}`), page: null },
        { replace: true },
      )
    },
    [defaultSort, searchNavigate, sorting],
  )
  const onPaginationChange: OnChangeFn<PaginationState> = useCallback(
    updater => {
      const nextPagination = typeof updater === 'function' ? updater(pagination) : updater
      setUrlPagination(nextPagination)
    },
    [pagination, setUrlPagination],
  )

  const {
    data: poolList,
    isPlaceholderData,
    isLoading,
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
  const poolCount = isPlaceholderData ? undefined : poolList?.count
  const emptyStateFilters = useMemo(
    () => ({
      ...(searchText && { [PoolColumnId.PoolName]: searchText }),
      ...(poolType && { [PoolColumnId.PoolTags]: poolType }),
    }),
    [poolType, searchText],
  )
  const data = useMemo(
    () => poolList?.pools.map(pool => getPoolListItem(network, pool)) ?? EMPTY,
    [network, poolList?.pools],
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
      loading={isLoading}
    >
      <LegacyTableFilters<PoolColumnId>
        filterExpandedKey={LOCAL_STORAGE_KEY}
        leftChildren={<LegacyTableFiltersTitles title={t`Pools`} subtitle={t`Find your next opportunity`} />}
        loading={isLoading}
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
            sortField={sortField}
            sortOptions={API_SORT_OPTIONS}
          />
        }
      />
    </LegacyDataTable>
  )
}
