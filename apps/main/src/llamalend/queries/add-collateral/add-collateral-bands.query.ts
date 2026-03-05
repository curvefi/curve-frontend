import { getLlamaMarket } from '@/llamalend/llama.utils'
import { queryFactory, rootKeys } from '@ui-kit/lib/model'
import { type CollateralParams, type CollateralQuery } from '../validation/manage-loan.types'
import { collateralValidationSuite } from '../validation/manage-loan.validation'

export const { useQuery: useAddCollateralBands } = queryFactory({
  queryKey: ({ chainId, marketId, userAddress, userCollateral }: CollateralParams) =>
    [...rootKeys.userMarket({ chainId, marketId, userAddress }), 'addCollateralBands', { userCollateral }] as const,
  queryFn: async ({ marketId, userCollateral }: CollateralQuery) => {
    const market = getLlamaMarket(marketId)
    const loan = 'loan' in market ? market.loan : market
    return await loan.addCollateralBands(userCollateral)
  },
  category: 'llamalend.addCollateral',
  validationSuite: collateralValidationSuite,
})
