import { getLlamaMarket } from '@/llamalend/llama.utils'
import type { Decimal } from '@primitives/decimal.utils'
import { queryFactory, rootKeys, type UserMarketParams, type UserMarketQuery } from '@ui-kit/lib/model'
import { userMarketValidationSuite } from '@ui-kit/lib/model/query/user-market-validation'
import type { QueryData } from '@ui-kit/lib/queries'

export const {
  useQuery: useUserState,
  invalidate: invalidateUserState,
  getQueryData: getUserState,
} = queryFactory({
  queryKey: (params: UserMarketParams) => [...rootKeys.userMarket(params), 'market-user-state'] as const,
  queryFn: async ({ marketId, userAddress }: UserMarketQuery) => {
    const market = getLlamaMarket(marketId)
    const userState = await market.userState(userAddress)

    return {
      /** The amount of collateral tokens the user's put in his loan */
      collateral: userState.collateral as Decimal,
      /**
       * The amount of crvUSD is in the AMM.
       * You can borrow 100 crvUSD with $1000 worth of ETH collateral,
       * and if you enter soft liquidation you can end up with 1100
       * in crvUSD even though your debt is still 100.
       */
      stablecoin: ('N' in userState ? userState.borrowed : userState.stablecoin) as Decimal,
      /**
       * The amount of crvUSD borrowed with the collateral.
       * This does not include the crvUSD in the AMM that
       * got there because of soft liquidations and such.
       */
      debt: userState.debt as Decimal,
    }
  },
  category: 'llamalend.userState',
  validationSuite: userMarketValidationSuite,
})

export type UserState = QueryData<typeof useUserState>
