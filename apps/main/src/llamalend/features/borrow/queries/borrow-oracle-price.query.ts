import type { IChainId } from '@curvefi/llamalend-api/lib/interfaces'
import { PoolParams, type PoolQuery, queryFactory, rootKeys } from '@ui-kit/lib/model'
import { llamaApiValidationSuite } from '@ui-kit/lib/model/query/curve-api-validation'
import { getLlamaMarket } from '../llama.util'

export const { useQuery: useBorrowOraclePrice } = queryFactory({
  queryKey: ({ chainId, poolId }: PoolParams<IChainId>) =>
    [...rootKeys.pool({ chainId, poolId }), 'oraclePrice'] as const,
  queryFn: ({ poolId }: PoolQuery<IChainId>): Promise<string> => getLlamaMarket(poolId).oraclePrice(),
  validationSuite: llamaApiValidationSuite,
})
