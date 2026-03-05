import { getLlamaMarket } from '@/llamalend/llama.utils'
import { queryFactory, rootKeys } from '@ui-kit/lib/model'
import { type CollateralParams, type CollateralQuery } from '../validation/manage-loan.types'
import { collateralValidationSuite } from '../validation/manage-loan.validation'
import { maxRemovableCollateralKey } from './remove-collateral-max-removable.query'

export const { useQuery: useRemoveCollateralBands } = queryFactory({
  queryKey: ({ chainId, marketId, userAddress, userCollateral }: CollateralParams) =>
    [...rootKeys.userMarket({ chainId, marketId, userAddress }), 'removeCollateralBands', { userCollateral }] as const,
  queryFn: async ({ marketId, userCollateral }: CollateralQuery) => {
    const market = getLlamaMarket(marketId)
    const loan = 'loan' in market ? market.loan : market
    return await loan.removeCollateralBands(userCollateral)
  },
  category: 'llamalend.removeCollateral',
  validationSuite: collateralValidationSuite,
  dependencies: (params) => [maxRemovableCollateralKey(params)],
})
