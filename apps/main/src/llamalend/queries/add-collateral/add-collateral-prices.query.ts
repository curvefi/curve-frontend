import { getLoanImplementation } from '@/llamalend/queries/market/market.query-helpers'
import type { Decimal } from '@primitives/decimal.utils'
import { queryFactory, rootKeys } from '@ui-kit/lib/model'
import type { Range } from '@ui-kit/types/util'
import { type CollateralParams, type CollateralQuery } from '../validation/manage-loan.types'
import { collateralValidationSuite } from '../validation/manage-loan.validation'

export const { useQuery: useAddCollateralPrices } = queryFactory({
  queryKey: ({ chainId, marketId, userAddress, userCollateral }: CollateralParams) =>
    [...rootKeys.userMarket({ chainId, marketId, userAddress }), 'addCollateralPrices', { userCollateral }] as const,
  queryFn: async ({ marketId, userCollateral }: CollateralQuery) =>
    (await getLoanImplementation(marketId).addCollateralPrices(userCollateral)) as Range<Decimal>,
  category: 'llamalend.addCollateral',
  validationSuite: collateralValidationSuite,
})
