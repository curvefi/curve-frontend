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
  queryKey: ({ chainId, marketId, userAddress, userCollateral }: CollateralParams) =>
    [...rootKeys.userMarket({ chainId, marketId, userAddress }), 'addCollateralBands', { userCollateral }] as const,
  queryFn: async ({ marketId, userCollateral }: CollateralQuery) =>
    await getLlamaMarket(marketId).addCollateralBands(userCollateral),
  validationSuite: collateralValidationSuite,
})

export const { useQuery: useAddCollateralPrices } = queryFactory({
  queryKey: ({ chainId, marketId, userAddress, userCollateral }: CollateralParams) =>
    [...rootKeys.userMarket({ chainId, marketId, userAddress }), 'addCollateralPrices', { userCollateral }] as const,
  queryFn: async ({ marketId, userCollateral }: CollateralQuery) =>
    (await getLlamaMarket(marketId).addCollateralPrices(userCollateral)) as Decimal[],
  validationSuite: collateralValidationSuite,
})

export const { useQuery: useAddCollateralHealth } = queryFactory({
  queryKey: ({ chainId, marketId, userAddress, userCollateral, isFull }: CollateralHealthParams) =>
    [
      ...rootKeys.userMarket({ chainId, marketId, userAddress }),
      'addCollateralHealth',
      { userCollateral },
      { isFull },
    ] as const,
  queryFn: async ({ marketId, userCollateral, isFull }: CollateralHealthQuery) =>
    (await getLlamaMarket(marketId).addCollateralHealth(userCollateral, isFull)) as Decimal,
  validationSuite: collateralHealthValidationSuite,
})
