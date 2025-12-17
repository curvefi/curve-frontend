import { getLlamaMarket } from '@/llamalend/llama.utils'
import { queryFactory, rootKeys } from '@ui-kit/lib/model'
import type { Decimal } from '@ui-kit/utils'
import { type CollateralHealthParams, type CollateralHealthQuery } from '../validation/manage-loan.types'
import { collateralHealthValidationSuite } from '../validation/manage-loan.validation'

export const { getQueryOptions: getAddCollateralHealthOptions } = queryFactory({
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
