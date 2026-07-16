import { getMarket } from '@/llamalend/llama.utils'
import type { IChainId } from '@curvefi/api/lib/interfaces'
import { LendMarketTemplate } from '@curvefi/llamalend-api/lib/lendMarkets'
import type { Decimal } from '@primitives/decimal.utils'
import { type FieldsOf, QueryData } from '@ui-kit/lib'
import { type MarketQuery, queryFactory, rootKeys, type UserQuery } from '@ui-kit/lib/model'
import { marketIdValidationSuite } from '@ui-kit/lib/model/query/market-id-validation'
import { decimalPercent, decimalSum } from '@ui-kit/utils'

type UserBalancesQuery = UserQuery & MarketQuery<IChainId>
type UserBalancesParams = FieldsOf<UserBalancesQuery>
type LendBalances = { collateral: Decimal; borrowed: Decimal; vaultShares: Decimal; gauge: Decimal }

export const { useQuery: useUserBalances } = queryFactory({
  queryKey: ({ chainId, marketId, userAddress }: UserBalancesParams) =>
    [...rootKeys.userMarket({ chainId, marketId, userAddress }), 'wallet.balances'] as const,
  queryFn: async ({ marketId }: UserBalancesQuery) => {
    const market = getMarket(marketId)
    if (market instanceof LendMarketTemplate) {
      const { collateral, borrowed, vaultShares, gauge } = (await market.wallet.balances()) as LendBalances
      const [vaultSharesConverted, gaugeConverted] = await Promise.all(
        [vaultShares, gauge].map(async v => (+v === 0 ? v : await market.vault.convertToAssets(v)) as Decimal),
      )
      return {
        collateral,
        borrowed,
        vaultShares,
        gauge,
        vaultSharesConverted,
        gaugeConverted,
        totalShares: decimalSum(vaultShares, gauge),
        stakedPercentage: decimalPercent(gauge, decimalSum(vaultShares, gauge)),
      }
    } else {
      const { stablecoin, collateral } = await market.wallet.balances()
      return { collateral: collateral as Decimal, borrowed: stablecoin as Decimal }
    }
  },
  category: 'llamalend.user',
  validationSuite: marketIdValidationSuite,
})

export type UserBalances = QueryData<typeof useUserBalances>
