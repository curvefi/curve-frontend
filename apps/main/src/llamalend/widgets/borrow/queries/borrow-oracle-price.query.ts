import type { IChainId } from '@curvefi/llamalend-api/lib/interfaces'
import { PoolParams, type PoolQuery, queryFactory, rootKeys } from '@ui-kit/lib/model'
import { llamaApiValidationSuite } from '@ui-kit/lib/model/query/curve-api-validation'
import { getLlamaMarket } from '../llama.util'

export const { useQuery: useBorrowOraclePrice } = queryFactory({
  queryKey: ({ chainId, poolId }: PoolParams<IChainId>) =>
    [...rootKeys.pool({ chainId, poolId }), 'borrow-oracle-price'] as const,
  queryFn: async ({ poolId }: PoolQuery<IChainId>): Promise<string> => {
    const [market] = getLlamaMarket(poolId)
    return await market.oraclePrice()
  },
  validationSuite: llamaApiValidationSuite,
})
