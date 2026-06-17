import { listPoolChains, listPools, type ListPoolsParams } from '@curvefi/prices-api/pools'
import { createValidationSuite, EmptyValidationSuite, type FieldsOf } from '@ui-kit/lib'
import { queryFactory, rootKeys, type ChainQuery } from '@ui-kit/lib/model'
import { chainValidationGroup } from '@ui-kit/lib/model/query/chain-validation'
import { getPageCount } from '@ui-kit/utils'

type PoolListQuery = ChainQuery &
  Pick<ListPoolsParams, 'page' | 'searchString' | 'poolType' | 'sortBy' | 'sortDirection'> & {
    pageSize?: ListPoolsParams['pagination']
  }
type PoolListParams = FieldsOf<PoolListQuery>

export const { useQuery: usePoolList } = queryFactory({
  queryKey: ({ chainId, page, pageSize, searchString, poolType, sortBy, sortDirection }: PoolListParams) =>
    [
      ...rootKeys.chain({ chainId }),
      'listPools',
      { page },
      { pageSize },
      { searchString },
      { poolType },
      { sortBy },
      { sortDirection },
    ] as const,
  queryFn: async ({ chainId, page, pageSize, searchString, poolType, sortBy, sortDirection }: PoolListQuery) => {
    const poolList = await listPools({
      chainId,
      page,
      pagination: pageSize,
      searchString,
      poolType,
      sortBy,
      sortDirection,
    })

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
