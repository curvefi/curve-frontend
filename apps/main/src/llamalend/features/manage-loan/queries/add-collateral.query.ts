import {
  collateralHealthValidationSuite,
  collateralValidationSuite,
} from '@/llamalend/features/manage-loan/queries/manage-loan.validation'
import { getLlamaMarket } from '@/llamalend/llama.utils'
import { queryFactory, rootKeys } from '@ui-kit/lib/model'
import type { Decimal } from '@ui-kit/utils'
import {
  type CollateralHealthParams,
  type CollateralHealthQuery,
  type CollateralParams,
  type CollateralQuery,
} from './manage-loan.types'

export const { useQuery: useAddCollateralBands } = queryFactory({
  queryKey: ({ chainId, poolId, userAddress, userCollateral }: CollateralParams) =>
    [...rootKeys.userPool({ chainId, poolId, userAddress }), 'addCollateralBands', { userCollateral }] as const,
  queryFn: async ({ poolId, userCollateral }: CollateralQuery) =>
    await getLlamaMarket(poolId).addCollateralBands(userCollateral),
  validationSuite: collateralValidationSuite,
})

export const { useQuery: useAddCollateralPrices } = queryFactory({
  queryKey: ({ chainId, poolId, userAddress, userCollateral }: CollateralParams) =>
    [...rootKeys.userPool({ chainId, poolId, userAddress }), 'addCollateralPrices', { userCollateral }] as const,
  queryFn: async ({ poolId, userCollateral }: CollateralQuery) =>
    (await getLlamaMarket(poolId).addCollateralPrices(userCollateral)) as Decimal[],
  validationSuite: collateralValidationSuite,
})

export const { useQuery: useAddCollateralHealth } = queryFactory({
  queryKey: ({ chainId, poolId, userAddress, userCollateral, isFull }: CollateralHealthParams) =>
    [
      ...rootKeys.userPool({ chainId, poolId, userAddress }),
      'addCollateralHealth',
      { userCollateral },
      { isFull },
    ] as const,
  queryFn: async ({ poolId, userCollateral, isFull }: CollateralHealthQuery) =>
    (await getLlamaMarket(poolId).addCollateralHealth(userCollateral, isFull)) as Decimal,
  validationSuite: collateralHealthValidationSuite,
})
