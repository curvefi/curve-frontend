import { getLlamaMarket } from '@/llamalend/llama.utils'
import type { IChainId } from '@curvefi/llamalend-api/lib/interfaces'
import type { Decimal } from '@primitives/decimal.utils'
import { type FieldsOf } from '@ui-kit/lib'
import type { UserMarketQuery, UserQuery } from '@ui-kit/lib/model'
import { queryFactory, rootKeys } from '@ui-kit/lib/model'
import { llamaApiValidationSuite } from '@ui-kit/lib/model/query/curve-api-validation'

type MaxRemovableQuery<T = IChainId> = UserMarketQuery<T> & UserQuery
type MaxRemovableParams<T = IChainId> = FieldsOf<MaxRemovableQuery<T>>

export const { useQuery: useMaxRemovableCollateral, queryKey: maxRemovableCollateralKey } = queryFactory({
  queryKey: (params: MaxRemovableParams) => [...rootKeys.userMarket(params), 'maxRemovable'] as const,
  queryFn: async ({ marketId }: MaxRemovableQuery) => (await getLlamaMarket(marketId).maxRemovable()) as Decimal,
  validationSuite: llamaApiValidationSuite,
})
