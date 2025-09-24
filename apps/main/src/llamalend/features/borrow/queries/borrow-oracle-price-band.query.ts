import { getLlamaMarket } from '@/llamalend/llama.utils'
import type { IChainId } from '@curvefi/llamalend-api/lib/interfaces'
import { type PoolParams, type PoolQuery, queryFactory, rootKeys } from '@ui-kit/lib/model'
import { llamaApiValidationSuite } from '@ui-kit/lib/model/query/curve-api-validation'

export const { useQuery: useBorrowOraclePriceBand } = queryFactory({
  queryKey: ({ chainId, poolId }: PoolParams<IChainId>) =>
    [...rootKeys.pool({ chainId, poolId }), 'oraclePriceBand'] as const,
  queryFn: ({ poolId }: PoolQuery<IChainId>): Promise<number> => getLlamaMarket(poolId).oraclePriceBand(),
  validationSuite: llamaApiValidationSuite(),
})
