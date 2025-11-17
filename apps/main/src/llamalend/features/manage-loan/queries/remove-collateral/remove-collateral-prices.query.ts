import { getLlamaMarket } from '@/llamalend/llama.utils'
import { queryFactory, rootKeys } from '@ui-kit/lib/model'
import { type CollateralParams, type CollateralQuery } from '../manage-loan.types'
import { collateralValidationSuite } from '../manage-loan.validation'
import { maxRemovableCollateralKey } from './remove-collateral-max-removable.query'

export const { useQuery: useRemoveCollateralPrices } = queryFactory({
  queryKey: ({ chainId, marketId, userAddress, userCollateral }: CollateralParams) =>
    [...rootKeys.userMarket({ chainId, marketId, userAddress }), 'removeCollateralPrices', { userCollateral }] as const,
  queryFn: async ({ marketId, userCollateral }: CollateralQuery) =>
    await getLlamaMarket(marketId).removeCollateralPrices(userCollateral),
  validationSuite: collateralValidationSuite,
  dependencies: (params) => [maxRemovableCollateralKey(params)],
})
