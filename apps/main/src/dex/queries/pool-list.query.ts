import { listLitePoolChains, listPoolChains, listPools, type ListPoolsParams } from '@curvefi/prices-api/pools'
import { chainValidationGroup } from '@evm-ui/lib/model/query/chain-validation'
import { rootKeys, type ChainParams, type ChainQuery } from '@evm-ui/queries/root-keys'
import { getPageCount } from '@evm-ui/utils'
import { queryFactory } from '@ui/features/queries/factory'
import { createValidationSuite, EmptyValidationSuite } from '@ui/lib/validation/lib'
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
type PoolListQuery = ChainQuery & PoolListRequestParams & { pageSize?: ListPoolsParams['pagination'] }
type PoolListParams = FieldsOf<PoolListQuery>

export const getPoolListRootQueryKey = ({ chainId }: ChainParams) =>
  [...rootKeys.chain({ chainId }), 'listPools'] as const

export const { useQuery: usePoolList } = queryFactory({
  queryKey: ({
    chainId,
    page,
    pageSize,
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
    [
      ...getPoolListRootQueryKey({ chainId }),
      { page },
      { pageSize },
      { searchString },
      { poolType },
      { minTvl },
      { maxTvl },
      { minVolume },
      { maxVolume },
      { minApy },
      { maxApy },
      { minCreationDate },
      { maxCreationDate },
      { sortBy },
      { sortDirection },
    ] as const,
  queryFn: async ({ pageSize, ...params }: PoolListQuery) => {
    const poolList = await listPools({ ...params, pagination: pageSize })

    return { ...poolList, pageCount: getPageCount(poolList.count, poolList.pagination) }
  },
  validationSuite: createValidationSuite(chainValidationGroup),
  category: 'dex.pools',
  keepPreviousData: true,
})

export const { useQuery: usePoolChains, queryKey: getPoolChainsQueryKey } = queryFactory({
  queryKey: () => ['listPoolChains'] as const,
  queryFn: () => listPoolChains(),
  validationSuite: EmptyValidationSuite,
  category: 'dex.network',
})

export const { useQuery: useLitePoolChains, queryKey: getLitePoolChainsQueryKey } = queryFactory({
  queryKey: () => ['listLitePoolChains', 'v2'] as const,
  queryFn: () => listLitePoolChains(),
  validationSuite: EmptyValidationSuite,
  category: 'dex.network',
})
