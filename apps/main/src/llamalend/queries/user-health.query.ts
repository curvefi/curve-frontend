import { getLlamaMarket } from '@/llamalend/llama.utils'
import { queryFactory, rootKeys, type UserMarketParams, type UserMarketQuery } from '@ui-kit/lib/model'
import { userMarketValidationSuite } from '@ui-kit/lib/model/query/user-market-validation'
import type { Decimal } from '@ui-kit/utils'

// TODO: This query if for the current user health, not the change in health when repaying debt.
// Use `market.repayHealth` for that.
export const { useQuery: useUserHealth, invalidate: invalidateUserHealth } = queryFactory({
  queryKey: (params: UserMarketParams) => [...rootKeys.userMarket(params), 'market-user-health'] as const,
  queryFn: async ({ marketId, userAddress }: UserMarketQuery) => {
    const market = getLlamaMarket(marketId)
    const healthFull = await market.userHealth(true, userAddress)
    const healthNotFull = await market.userHealth(false, userAddress)

    // Docs courtesy of Saint Rat
    return {
      /**
       * healthNotFull is like your soft-liquidation buffer, it's unchanging unless you're in soft-liq.
       * It means you estimate the value of each bit of collateral in each band, and compare against debt
       *
       * For a simple example with 2 bands each with 1 ETH:
       *  range: $1000-$1200, mid point is $1100, band value is 1 ETH x $1100 = $1100
       *  range: $1200-$1400, mid point is $1300, band value is 1 ETH x $1300 = $1300
       *
       * Total collateral value is therefore $1100 + $1300, so $2400, if debt is $2000, then health should be 2400/2000 - 100% = 20%
       */
      healthNotFull: healthNotFull as Decimal,
      /**
       * healthFull means you also add in the value above the bands to healthNotFull (soft-liq buffer),
       *
       * e.g. if we continue with the above example and the ETH price is currently $2000:
       *  The top band finishes at $1400, so the price is currently $600 above the bands.
       *  We then add $600 x 2 ETH to the collateral value = $1200
       *
       * Total collateral value is therefore $2400 + $1200 = $3600, so health should be 3600/2000 - 100% = 80%
       */
      healthFull: healthFull as Decimal,
      // TL;DR In or below soft-liq healthFull = healthNotFull, above soft-liq healthFull > healthNotFull */
      /** When healthNotFull is below 0, the user is in soft-liq and we should return the corresponding metric. */
      health: (+healthNotFull < 0 ? healthNotFull : healthFull) as Decimal,
    }
  },
  validationSuite: userMarketValidationSuite,
})
