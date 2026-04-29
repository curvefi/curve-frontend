import { getLoanImplementation } from '@/llamalend/queries/market/market.query-helpers'
import { queryFactory, rootKeys } from '@ui-kit/lib/model'
import { type CollateralParams, type CollateralQuery } from '../validation/manage-loan.types'
import { collateralValidationSuite } from '../validation/manage-loan.validation'
import { maxRemovableCollateralKey } from './remove-collateral-max-removable.query'

export const { useQuery: useRemoveCollateralBands } = queryFactory({
  queryKey: ({ chainId, marketId, userAddress, userCollateral }: CollateralParams) =>
    [...rootKeys.userMarket({ chainId, marketId, userAddress }), 'removeCollateralBands', { userCollateral }] as const,
  queryFn: async ({ marketId, userCollateral }: CollateralQuery) =>
    await getLoanImplementation(marketId).removeCollateralBands(userCollateral),
  category: 'llamalend.removeCollateral',
  validationSuite: collateralValidationSuite,
  dependencies: params => [maxRemovableCollateralKey(params)],
})
