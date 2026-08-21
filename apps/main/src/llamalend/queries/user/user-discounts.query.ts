import { getUserPositionImplementation } from '@/llamalend/queries/market/market.query-helpers'
import { queryFactory, rootKeys, type UserMarketParams, type UserMarketQuery } from '@evm-ui/lib/model'
import { userMarketValidationSuite } from '@evm-ui/lib/model/query/user-market-validation'
import type { Decimal } from '@primitives/decimal.utils'

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
