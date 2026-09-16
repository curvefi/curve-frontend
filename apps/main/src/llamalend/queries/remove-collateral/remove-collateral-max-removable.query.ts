import { getLoanImplementation } from '@/llamalend/queries/market/market.query-helpers'
import type { IChainId } from '@curvefi/llamalend-api/lib/interfaces'
import type { UserMarketQuery, UserQuery } from '@evm-ui/lib/model'
import { rootKeys } from '@evm-ui/lib/model'
import { llamaApiValidationSuite } from '@evm-ui/lib/model/query/curve-api-validation'
import type { Decimal } from '@primitives/decimal.utils'
import { queryFactory } from '@ui/features/queries/factory'
import { type FieldsOf } from '@ui/lib/validation/types'

type MaxRemovableQuery<T = IChainId> = UserMarketQuery<T> & UserQuery
type MaxRemovableParams<T = IChainId> = FieldsOf<MaxRemovableQuery<T>>

export const {
  useQuery: useMaxRemovableCollateral,
  queryKey: maxRemovableCollateralKey,
  reset: invalidateMaxRemovableCollateral,
} = queryFactory({
  queryKey: (params: MaxRemovableParams) => [...rootKeys.userMarket(params), 'maxRemovable'] as const,
  queryFn: async ({ marketId }: MaxRemovableQuery) => (await getLoanImplementation(marketId).maxRemovable()) as Decimal,
  category: 'llamalend.removeCollateral',
  validationSuite: llamaApiValidationSuite,
})
