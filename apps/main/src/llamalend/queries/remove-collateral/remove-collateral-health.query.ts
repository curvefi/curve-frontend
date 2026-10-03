import { getLoanImplementation } from '@/llamalend/queries/market/market.query-helpers'
import type { Decimal } from '@primitives/decimal.utils'
import { queryFactory } from '@ui/features/queries/factory'
import { type CollateralHealthParams, type CollateralHealthQuery } from '../validation/manage-loan.types'
import { collateralHealthValidationSuite } from '../validation/manage-loan.validation'

export const { getQueryOptions: getRemoveCollateralHealthOptions } = queryFactory({
  queryKey: ({ chainId, marketId, userAddress, userCollateral, isFull }: CollateralHealthParams) => ({
    name: 'removeCollateralHealth',
    chainId,
    marketId,
    userAddress,
    userCollateral,
    isFull,
  }),
  queryFn: async ({ marketId, userCollateral, isFull }: CollateralHealthQuery) =>
    (await getLoanImplementation(marketId).removeCollateralHealth(userCollateral, isFull)) as Decimal,
  category: 'llamalend.removeCollateral',
  validationSuite: collateralHealthValidationSuite,
})
