import { getLlamaMarket } from '@/llamalend/llama.utils'
import { LendMarketTemplate } from '@curvefi/llamalend-api/lib/lendMarkets'
import type { UserMarketQuery } from '@ui-kit/lib/model'
import { queryFactory, rootKeys } from '@ui-kit/lib/model'
import { loanExistsValidationGroup } from '@ui-kit/lib/model/query/loan-exists-validation'
import { userMarketValidationSuite } from '@ui-kit/lib/model/query/user-market-validation'
import { createValidationSuite, FieldsOf } from '@ui-kit/lib/validation'
import type { BandsBalances } from '../types'
import { sortBands, fetchChartBandBalancesData } from './utils'
import { liquidationBandValidationGroup } from './validation'

const isMarket = false

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
      'market-user-bands-balances',
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
  category: 'user',
  validationSuite: marketUserBandsBalancesValidationSuite,
})
