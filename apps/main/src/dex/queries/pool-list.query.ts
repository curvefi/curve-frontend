import { listLitePoolChains, listPoolChains, listPools, type ListPoolsParams } from '@curvefi/prices-api/pools'
import type { ChainParams, ChainQuery } from '@evm-ui/queries/query-types'
import { chainValidationSuite } from '@evm-ui/queries/validation/chain-validation'
import { getPageCount } from '@evm-ui/utils'
import { queryFactory } from '@ui/features/queries/factory'
import { ACTIVE_POOL_DAYS, MILLISECONDS_PER_SECOND, SECONDS_PER_DAY } from '@ui/lib/time'
import { EmptyValidationSuite } from '@ui/lib/validation/lib'
import { type FieldsOf } from '@ui/lib/validation/types'

type PoolListRequestParams = Pick<
  ListPoolsParams,
  | 'page'
  | 'searchString'
  | 'poolType'
  | 'minTvl'
  | 'maxTvl'
  | 'minVolume'
  | 'maxVolume'
  | 'minApy'
  | 'maxApy'
  | 'minCreationDate'
  | 'maxCreationDate'
  | 'sortBy'
  | 'sortDirection'
>
type PoolListQuery = ChainQuery &
  PoolListRequestParams & { pageSize?: ListPoolsParams['pagination']; activePoolsFilter?: boolean }
type PoolListParams = FieldsOf<PoolListQuery>

/** Applies active pools filter to given params, except when the given params have stronger constraints. */
const applyActivePoolsFilter = (params: ListPoolsParams): ListPoolsParams => ({
  ...params,
  minTvl: Math.max(params.minTvl ?? 0, Number.MIN_VALUE),
  maxCreationDate: Math.min(
    params.maxCreationDate ?? Infinity,
    Math.floor(Date.now() / MILLISECONDS_PER_SECOND) - ACTIVE_POOL_DAYS * SECONDS_PER_DAY,
  ),
})

export const getPoolListRootQueryKey = ({ chainId }: ChainParams) => ({ name: 'listPools', chainId }) as const

export const { useQuery: usePoolList } = queryFactory({
  queryKey: ({
    chainId,
    page,
    pageSize,
    activePoolsFilter,
    searchString,
    poolType,
    minTvl,
    maxTvl,
    minVolume,
    maxVolume,
    minApy,
    maxApy,
    minCreationDate,
    maxCreationDate,
    sortBy,
    sortDirection,
  }: PoolListParams) =>
    ({
      name: 'listPools',
      chainId,
      page,
      pageSize,
      activePoolsFilter,
      searchString,
      poolType,
      minTvl,
      maxTvl,
      minVolume,
      maxVolume,
      minApy,
      maxApy,
      minCreationDate,
      maxCreationDate,
      sortBy,
      sortDirection,
    }) as const,
  queryFn: async ({ pageSize, activePoolsFilter, ...params }: PoolListQuery) => {
    const poolList = await listPools({
      ...(activePoolsFilter ? applyActivePoolsFilter(params) : params),
      pagination: pageSize,
    })

    return { ...poolList, pageCount: getPageCount(poolList.count, poolList.pagination) }
  },
  validationSuite: chainValidationSuite,
  category: 'dex.pools',
  // We want this to prevent a layout shift with skeleton rows when navigating pages.
  keepPreviousData: (previous, current) => previous.chainId === current.chainId,
})

export const { useQuery: usePoolChains, queryKey: getPoolChainsQueryKey } = queryFactory({
  queryKey: () => ({ name: 'listPoolChains' }) as const,
  queryFn: () => listPoolChains(),
  validationSuite: EmptyValidationSuite,
  category: 'dex.network',
})

export const { useQuery: useLitePoolChains, queryKey: getLitePoolChainsQueryKey } = queryFactory({
  queryKey: () => ({ name: 'listLitePoolChains', version: 2 }) as const,
  queryFn: () => listLitePoolChains(),
  validationSuite: EmptyValidationSuite,
  category: 'dex.network',
})
