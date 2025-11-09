import { getLlamaMarket } from '@/llamalend/llama.utils'
import { LendMarketTemplate } from '@curvefi/llamalend-api/lib/lendMarkets'
import type { MarketQuery } from '@ui-kit/lib/model'
import { queryFactory, rootKeys } from '@ui-kit/lib/model'
import { marketIdValidationSuite } from '@ui-kit/lib/model/query/market-id-validation'
import { createValidationSuite, FieldsOf } from '@ui-kit/lib/validation'
import { sortBands, fetchChartBandBalancesData } from './utils'
import { liquidationBandValidationGroup } from './validation'

const isMarket = true

type MarketBandsBalancesQuery = MarketQuery & {
  liquidationBand: number
}
type MarketBandsBalancesParams = FieldsOf<MarketBandsBalancesQuery>

export const marketBandsBalancesValidationSuite = createValidationSuite((params: MarketBandsBalancesParams) => {
  marketIdValidationSuite(params)
  liquidationBandValidationGroup(params)
})

export const { useQuery: useMarketBandsBalances } = queryFactory({
  queryKey: ({ chainId, marketId, liquidationBand }: MarketBandsBalancesParams) =>
    [...rootKeys.market({ chainId, marketId }), 'market-bands-balances', { liquidationBand }] as const,
  queryFn: async ({ marketId, liquidationBand }: MarketBandsBalancesQuery) => {
    const market = getLlamaMarket(marketId)
    const normalizedLiquidationBand = liquidationBand ?? null
    // lend
    if (market instanceof LendMarketTemplate) {
      const bandsBalances = await market.stats.bandsBalances()
      return await fetchChartBandBalancesData(sortBands(bandsBalances), normalizedLiquidationBand, market, isMarket)
      // mint
    } else {
      const bandsBalances = await market.stats.bandsBalances()
      // format bands balances to the same format as lend market bands balances
      const formattedBandsBalances = Object.fromEntries(
        Object.entries(bandsBalances).map(([key, value]) => [
          key,
          { borrowed: value.stablecoin, collateral: value.collateral },
        ]),
      )
      return await fetchChartBandBalancesData(
        sortBands(formattedBandsBalances),
        normalizedLiquidationBand,
        market,
        isMarket,
      )
    }
  },
  validationSuite: marketBandsBalancesValidationSuite,
})
