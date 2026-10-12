import { getAllPoolTrades, type GetAllPoolTradesParams } from '@curvefi/prices-api/pools'
import { DEFAULT_PAGE_SIZE, DEFAULT_PAGE_START_INDEX } from '@evm-ui/features/activity-table/utils'
import { contractValidationGroup } from '@evm-ui/queries/validation/contract-validation'
import { queryFactory } from '@ui/features/queries/factory'
import { createValidationSuite } from '@ui/lib/validation/lib'
import { type FieldsOf } from '@ui/lib/validation/types'

type PoolTradesParams = FieldsOf<GetAllPoolTradesParams>

export const { useQuery: usePoolTrades } = queryFactory({
  queryKey: ({ blockchainId, poolAddress, page, perPage, includeState }: PoolTradesParams) =>
    ({ name: 'pool-trades', blockchainId, poolAddress, page, perPage, includeState }) as const,
  queryFn: async ({
    blockchainId,
    poolAddress,
    page = DEFAULT_PAGE_START_INDEX,
    perPage = DEFAULT_PAGE_SIZE,
    includeState = false,
  }: GetAllPoolTradesParams) => getAllPoolTrades({ blockchainId, poolAddress, page, perPage, includeState }),
  validationSuite: createValidationSuite(({ blockchainId, poolAddress }: PoolTradesParams) => {
    contractValidationGroup({ blockchainId, contractAddress: poolAddress })
  }),
  category: 'dex.pool',
})
