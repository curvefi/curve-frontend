import { listPoolChains, listPools, type ListPoolsParams } from '@curvefi/prices-api/pools'
import { createValidationSuite, EmptyValidationSuite, type FieldsOf } from '@ui-kit/lib'
import { queryFactory, rootKeys, type ChainQuery } from '@ui-kit/lib/model'
import { chainValidationGroup } from '@ui-kit/lib/model/query/chain-validation'

type PoolListQuery = ChainQuery &
  Pick<ListPoolsParams, 'page' | 'pagination' | 'searchString' | 'poolType' | 'sortBy' | 'sortDirection'>
type PoolListParams = FieldsOf<PoolListQuery>

export const { useQuery: usePoolList } = queryFactory({
  queryKey: ({ chainId, page, pagination, searchString, poolType, sortBy, sortDirection }: PoolListParams) =>
    [
      ...rootKeys.chain({ chainId }),
      'listPools',
      { page },
      { pagination },
      { searchString },
      { poolType },
      { sortBy },
      { sortDirection },
    ] as const,
  queryFn: async ({ chainId, page, pagination, searchString, poolType, sortBy, sortDirection }: PoolListQuery) =>
    listPools({ chainId, page, pagination, searchString, poolType, sortBy, sortDirection }),
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
