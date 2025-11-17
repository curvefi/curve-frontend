import {
  type CollateralHealthParams,
  type CollateralHealthQuery,
  type CollateralParams,
  type CollateralQuery,
} from '@/llamalend/features/manage-loan/queries/manage-loan.types'
import {
  collateralHealthValidationSuite,
  collateralValidationSuite,
} from '@/llamalend/features/manage-loan/queries/manage-loan.validation'
import { getLlamaMarket } from '@/llamalend/llama.utils'
import type { IChainId } from '@curvefi/llamalend-api/lib/interfaces'
import { type FieldsOf } from '@ui-kit/lib'
import type { UserMarketQuery, UserQuery } from '@ui-kit/lib/model'
import { queryFactory, rootKeys } from '@ui-kit/lib/model'
import { llamaApiValidationSuite } from '@ui-kit/lib/model/query/curve-api-validation'
import type { Decimal } from '@ui-kit/utils'

type MaxRemovableQuery<T = IChainId> = UserMarketQuery<T> & UserQuery
type MaxRemovableParams<T = IChainId> = FieldsOf<MaxRemovableQuery<T>>

export const { useQuery: useMaxRemovableCollateral, queryKey: maxRemovableCollateralKey } = queryFactory({
  queryKey: (params: MaxRemovableParams) => [...rootKeys.userMarket(params), 'maxRemovable'] as const,
  queryFn: async ({ marketId }: MaxRemovableQuery) => (await getLlamaMarket(marketId).maxRemovable()) as Decimal,
  validationSuite: llamaApiValidationSuite,
})

export const { useQuery: useRemoveCollateralBands } = queryFactory({
  queryKey: ({ chainId, marketId, userAddress, userCollateral }: CollateralParams) =>
    [...rootKeys.userMarket({ chainId, marketId, userAddress }), 'removeCollateralBands', { userCollateral }] as const,
  queryFn: async ({ marketId, userCollateral }: CollateralQuery) =>
    await getLlamaMarket(marketId).removeCollateralBands(userCollateral),
  validationSuite: collateralValidationSuite,
  dependencies: (params) => [maxRemovableCollateralKey(params)],
})

export const { useQuery: useRemoveCollateralPrices } = queryFactory({
  queryKey: ({ chainId, marketId, userAddress, userCollateral }: CollateralParams) =>
    [...rootKeys.userMarket({ chainId, marketId, userAddress }), 'removeCollateralPrices', { userCollateral }] as const,
  queryFn: async ({ marketId, userCollateral }: CollateralQuery) =>
    await getLlamaMarket(marketId).removeCollateralPrices(userCollateral),
  validationSuite: collateralValidationSuite,
  dependencies: (params) => [maxRemovableCollateralKey(params)],
})

export const { useQuery: useRemoveCollateralHealth } = queryFactory({
  queryKey: ({ chainId, marketId, userAddress, userCollateral, isFull }: CollateralHealthParams) =>
    [
      ...rootKeys.userMarket({ chainId, marketId, userAddress }),
      'removeCollateralHealth',
      { userCollateral },
      { isFull },
    ] as const,
  queryFn: async ({ marketId, userCollateral, isFull }: CollateralHealthQuery) =>
    (await getLlamaMarket(marketId).removeCollateralHealth(userCollateral, isFull)) as Decimal,
  validationSuite: collateralHealthValidationSuite,
})
