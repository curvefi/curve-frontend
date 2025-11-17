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
import type { UserPoolQuery, UserQuery } from '@ui-kit/lib/model'
import { queryFactory, rootKeys } from '@ui-kit/lib/model'
import { llamaApiValidationSuite } from '@ui-kit/lib/model/query/curve-api-validation'
import type { Decimal } from '@ui-kit/utils'

type MaxRemovableQuery<T = IChainId> = UserPoolQuery<T> & UserQuery
type MaxRemovableParams<T = IChainId> = FieldsOf<MaxRemovableQuery<T>>

export const { useQuery: useMaxRemovableCollateral, queryKey: maxRemovableCollateralKey } = queryFactory({
  queryKey: (params: MaxRemovableParams) => [...rootKeys.userPool(params), 'maxRemovable'] as const,
  queryFn: async ({ poolId }: MaxRemovableQuery) => (await getLlamaMarket(poolId).maxRemovable()) as Decimal,
  validationSuite: llamaApiValidationSuite,
})

export const { useQuery: useRemoveCollateralBands } = queryFactory({
  queryKey: ({ chainId, poolId, userAddress, userCollateral }: CollateralParams) =>
    [...rootKeys.userPool({ chainId, poolId, userAddress }), 'removeCollateralBands', { userCollateral }] as const,
  queryFn: async ({ poolId, userCollateral }: CollateralQuery) =>
    await getLlamaMarket(poolId).removeCollateralBands(userCollateral),
  validationSuite: collateralValidationSuite,
  dependencies: (params) => [maxRemovableCollateralKey(params)],
})

export const { useQuery: useRemoveCollateralPrices } = queryFactory({
  queryKey: ({ chainId, poolId, userAddress, userCollateral }: CollateralParams) =>
    [...rootKeys.userPool({ chainId, poolId, userAddress }), 'removeCollateralPrices', { userCollateral }] as const,
  queryFn: async ({ poolId, userCollateral }: CollateralQuery) =>
    await getLlamaMarket(poolId).removeCollateralPrices(userCollateral),
  validationSuite: collateralValidationSuite,
  dependencies: (params) => [maxRemovableCollateralKey(params)],
})

export const { useQuery: useRemoveCollateralHealth } = queryFactory({
  queryKey: ({ chainId, poolId, userAddress, userCollateral, isFull }: CollateralHealthParams) =>
    [
      ...rootKeys.userPool({ chainId, poolId, userAddress }),
      'removeCollateralHealth',
      { userCollateral },
      { isFull },
    ] as const,
  queryFn: async ({ poolId, userCollateral, isFull }: CollateralHealthQuery) =>
    (await getLlamaMarket(poolId).removeCollateralHealth(userCollateral, isFull)) as Decimal,
  validationSuite: collateralHealthValidationSuite,
})
