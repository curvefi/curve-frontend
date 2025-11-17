import { getLlamaMarket } from '@/llamalend/llama.utils'
import { queryFactory, rootKeys } from '@ui-kit/lib/model'
import type { Decimal } from '@ui-kit/utils'
import { type CollateralHealthParams, type CollateralHealthQuery } from '../manage-loan.types'
import { collateralHealthValidationSuite } from '../manage-loan.validation'

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
