import { getUserPositionImplementation } from '@/llamalend/queries/market/market.query-helpers'
import type { Decimal } from '@primitives/decimal.utils'
import { queryFactory, rootKeys, type UserMarketParams, type UserMarketQuery } from '@ui-kit/lib/model'
import { userMarketValidationSuite } from '@ui-kit/lib/model/query/user-market-validation'

export const { useQuery: useUserDiscounts, queryKey: getUserDiscountsKey } = queryFactory({
  queryKey: (params: UserMarketParams) => [...rootKeys.userMarket(params), 'userDiscounts'] as const,
  queryFn: async ({ marketId, userAddress }: UserMarketQuery) => {
    const { loanDiscount, liquidationDiscount } =
      await getUserPositionImplementation(marketId).userDiscounts(userAddress)
    return { loanDiscount: loanDiscount as Decimal, liquidationDiscount: liquidationDiscount as Decimal }
  },
  category: 'llamalend.user',
  validationSuite: userMarketValidationSuite,
})
