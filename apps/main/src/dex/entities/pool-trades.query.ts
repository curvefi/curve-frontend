import { getAllPoolTrades, type GetAllPoolTradesParams } from '@curvefi/prices-api/pools'
import { DEFAULT_PAGE_SIZE, DEFAULT_PAGE_START_INDEX } from '@evm-ui/features/activity-table/utils'
import { contractValidationGroup } from '@evm-ui/lib/model/query/contract-validation'
import { queryFactory } from '@ui/features/queries/factory'
import { createValidationSuite } from '@ui/lib/validation/lib'
import { type FieldsOf } from '@ui/lib/validation/types'

type PoolTradesParams = FieldsOf<GetAllPoolTradesParams>

export const { useQuery: usePoolTrades } = queryFactory({
  queryKey: ({ chain, poolAddress, page, perPage, includeState }: PoolTradesParams) =>
    ['pool-trades', { chain }, { poolAddress }, { page }, { perPage }, { includeState }] as const,
  queryFn: async ({
    chain,
    poolAddress,
    page = DEFAULT_PAGE_START_INDEX,
    perPage = DEFAULT_PAGE_SIZE,
    includeState = false,
  }: GetAllPoolTradesParams) => getAllPoolTrades({ chain, poolAddress, page, perPage, includeState }),
  validationSuite: createValidationSuite(({ chain, poolAddress }: PoolTradesParams) => {
    contractValidationGroup({ blockchainId: chain, contractAddress: poolAddress })
  }),
  category: 'dex.pool',
})
