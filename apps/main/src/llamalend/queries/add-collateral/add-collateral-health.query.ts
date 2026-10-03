import { getLoanImplementation } from '@/llamalend/queries/market/market.query-helpers'
import type { Decimal } from '@primitives/decimal.utils'
import { queryFactory } from '@ui/features/queries/factory'
import { type CollateralHealthParams, type CollateralHealthQuery } from '../validation/manage-loan.types'
import { collateralHealthValidationSuite } from '../validation/manage-loan.validation'

export const { getQueryOptions: getAddCollateralHealthOptions } = queryFactory({
  queryKey: ({ chainId, marketId, userAddress, userCollateral, isFull }: CollateralHealthParams) => ({
    name: 'addCollateralHealth',
    chainId,
    marketId,
    userAddress,
    userCollateral,
    isFull,
  }),
  queryFn: async ({ marketId, userCollateral, isFull }: CollateralHealthQuery) =>
    (await getLoanImplementation(marketId).addCollateralHealth(userCollateral, isFull)) as Decimal,
  category: 'llamalend.addCollateral',
  validationSuite: collateralHealthValidationSuite,
})
