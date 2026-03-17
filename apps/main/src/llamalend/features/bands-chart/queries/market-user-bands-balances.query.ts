import { getLlamaMarket } from '@/llamalend/llama.utils'
import type { IChainId } from '@curvefi/llamalend-api/lib/interfaces'
import { LendMarketTemplate } from '@curvefi/llamalend-api/lib/lendMarkets'
import { queryClient } from '@ui-kit/lib/api/query-client'
import type { UserMarketParams, UserMarketQuery } from '@ui-kit/lib/model'
import { queryFactory, rootKeys } from '@ui-kit/lib/model'
import { loanExistsValidationGroup } from '@ui-kit/lib/model/query/loan-exists-validation'
import { userMarketValidationSuite } from '@ui-kit/lib/model/query/user-market-validation'
import { createValidationSuite, FieldsOf } from '@ui-kit/lib/validation'
import type { BandsBalances } from '../types'
import { sortBands, fetchChartBandBalancesData } from './utils'
import { liquidationBandValidationGroup } from './validation'

const isMarket = false
const QUERY_KEY = 'userBandsBalances' as const

type MarketUserBandsBalancesQuery = UserMarketQuery & {
  loanExists: boolean
  liquidationBand: number
}
type MarketUserBandsBalancesParams = FieldsOf<MarketUserBandsBalancesQuery>

const marketUserBandsBalancesValidationSuite = createValidationSuite((params: MarketUserBandsBalancesParams) => {
  userMarketValidationSuite(params)
  loanExistsValidationGroup(params)
  liquidationBandValidationGroup(params)
})

export const { useQuery: useMarketUserBandsBalances } = queryFactory({
  queryKey: ({ chainId, marketId, userAddress, loanExists, liquidationBand }: MarketUserBandsBalancesParams) =>
    [
      ...rootKeys.userMarket({ chainId, marketId, userAddress }),
      QUERY_KEY,
      { loanExists },
      { liquidationBand },
    ] as const,
  queryFn: async ({ marketId, userAddress, liquidationBand }: MarketUserBandsBalancesQuery) => {
    const market = getLlamaMarket(marketId)

    if (market instanceof LendMarketTemplate) {
      const userBandsBalances = await market.userBandsBalances(userAddress)

      return fetchChartBandBalancesData(sortBands(userBandsBalances), liquidationBand, market, isMarket)
    } else {
      const userBandsBalances = await market.userBandsBalances(userAddress)

      const formattedUserBandsBalances: BandsBalances = Object.fromEntries(
        Object.entries(userBandsBalances).map(([key, value]) => [
          key,
          { borrowed: value.stablecoin, collateral: value.collateral },
        ]),
      )

      return fetchChartBandBalancesData(sortBands(formattedUserBandsBalances), liquidationBand, market, isMarket)
    }
  },
  category: 'llamalend.user',
  validationSuite: marketUserBandsBalancesValidationSuite,
})

/**
 * Prefix-based invalidation because the query key includes extra params (loanExists, liquidationBand)
 * that aren't available at invalidation time. User band balances can change even when those params stay the same.
 */
export const invalidateMarketUserBandsBalances = ({ chainId, marketId, userAddress }: UserMarketParams<IChainId>) =>
  queryClient.invalidateQueries({
    queryKey: [...rootKeys.userMarket({ chainId, marketId, userAddress }), QUERY_KEY],
  })
