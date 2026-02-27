import { getLlamaMarket } from '@/llamalend/llama.utils'
import type { IChainId } from '@curvefi/api/lib/interfaces'
import { LendMarketTemplate } from '@curvefi/llamalend-api/lib/lendMarkets'
import type { Decimal } from '@primitives/decimal.utils'
import { type FieldsOf } from '@ui-kit/lib'
import { type MarketQuery, queryFactory, rootKeys, type UserQuery } from '@ui-kit/lib/model'
import { marketIdValidationSuite } from '@ui-kit/lib/model/query/market-id-validation'

type UserBalancesQuery = UserQuery & MarketQuery<IChainId>
type UserBalancesParams = FieldsOf<UserBalancesQuery>

export const { useQuery: useUserBalances, invalidate: invalidateUserBalances } = queryFactory({
  queryKey: ({ chainId, marketId, userAddress }: UserBalancesParams) =>
    [...rootKeys.userMarket({ chainId, marketId, userAddress }), 'wallet-balances'] as const,
  queryFn: async ({ marketId }: UserBalancesQuery) => {
    const market = getLlamaMarket(marketId)
    if (market instanceof LendMarketTemplate) {
      const { collateral, borrowed, vaultShares, gauge } = await market.wallet.balances()

      return {
        collateral: collateral as Decimal,
        borrowed: borrowed as Decimal,
        vaultShares: vaultShares as Decimal,
        gauge: gauge as Decimal,
      }
    } else {
      const { stablecoin, collateral } = await market.wallet.balances()
      return { collateral: collateral as Decimal, borrowed: stablecoin as Decimal }
    }
  },
  staleTime: '1m',
  validationSuite: marketIdValidationSuite,
})
