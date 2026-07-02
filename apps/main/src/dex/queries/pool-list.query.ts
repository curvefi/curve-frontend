import { listPoolChains, listPools, type ListPoolsParams } from '@curvefi/prices-api/pools'
import { createValidationSuite, EmptyValidationSuite, type FieldsOf } from '@ui-kit/lib'
import { queryFactory, rootKeys, type ChainQuery } from '@ui-kit/lib/model'
import { chainValidationGroup } from '@ui-kit/lib/model/query/chain-validation'
import { getPageCount } from '@ui-kit/utils'

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
  PoolListRequestParams & {
    pageSize?: ListPoolsParams['pagination']
  }
type PoolListParams = FieldsOf<PoolListQuery>

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
      ...rootKeys.chain({ chainId }),
      'listPools',
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

export const { useQuery: usePoolChains } = queryFactory({
  queryKey: () => ['listPoolChains'] as const,
  queryFn: () => listPoolChains(),
  validationSuite: EmptyValidationSuite,
  category: 'dex.network',
})
