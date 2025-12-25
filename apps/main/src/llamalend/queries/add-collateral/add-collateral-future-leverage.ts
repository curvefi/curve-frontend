import { getLlamaMarket } from '@/llamalend/llama.utils'
import { queryFactory, rootKeys } from '@ui-kit/lib/model'
import { type CollateralParams, type CollateralQuery } from '../validation/manage-loan.types'
import { collateralValidationSuite } from '../validation/manage-loan.validation'

export const { useQuery: useAddCollateralFutureLeverage } = queryFactory({
  queryKey: ({ chainId, marketId, userAddress, userCollateral }: CollateralParams) =>
    [
      ...rootKeys.userMarket({ chainId, marketId, userAddress }),
      'addCollateralFutureLeverage',
      { userCollateral },
    ] as const,
  queryFn: async ({ marketId, userCollateral }: CollateralQuery) =>
    await getLlamaMarket(marketId).addCollateralFutureLeverage(userCollateral),
  validationSuite: collateralValidationSuite,
})
