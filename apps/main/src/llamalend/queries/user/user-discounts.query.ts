import { getUserPositionImplementation } from '@/llamalend/queries/market/market.query-helpers'
import type { UserMarketParams, UserMarketQuery } from '@evm-ui/queries/query-types'
import { userMarketValidationSuite } from '@evm-ui/queries/validation/user-market-validation'
import type { Decimal } from '@primitives/decimal.utils'
import { queryFactory } from '@ui/features/queries/factory'

export const { useQuery: useUserDiscounts, queryKey: getUserDiscountsKey } = queryFactory({
  queryKey: ({ chainId, marketId, userAddress }: UserMarketParams) =>
    ({ name: 'userDiscounts', chainId, marketId, userAddress }) as const,
  queryFn: async ({ marketId, userAddress }: UserMarketQuery) => {
    const { loanDiscount, liquidationDiscount } =
      await getUserPositionImplementation(marketId).userDiscounts(userAddress)
    return { loanDiscount: loanDiscount as Decimal, liquidationDiscount: liquidationDiscount as Decimal }
  },
  category: 'llamalend.user',
  validationSuite: userMarketValidationSuite,
})
