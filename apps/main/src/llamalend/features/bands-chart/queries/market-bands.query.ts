import { getLlamaMarket } from '@/llamalend/llama.utils'
import { LendMarketTemplate } from '@curvefi/llamalend-api/lib/lendMarkets'
import type { MarketQuery, MarketParams } from '@ui-kit/lib/model'
import { queryFactory, rootKeys } from '@ui-kit/lib/model'
import { llamaApiValidationSuite } from '@ui-kit/lib/model/query/curve-api-validation'
import { decimal, Decimal } from '@ui-kit/utils'
import { sortLendBands, sortMintBands, fetchLendChartBandBalancesData, fetchMintChartBandBalancesData } from './utils'

// TODO: refactor to reduce code duplication
export const { useQuery: useMarketBands } = queryFactory({
  queryKey: ({ chainId, marketId }: MarketParams) =>
    [...rootKeys.market({ chainId, marketId }), 'market-bands'] as const,
  queryFn: async ({ marketId }: MarketQuery) => {
    const market = getLlamaMarket(marketId)
    // lend
    if (market instanceof LendMarketTemplate) {
      const [balances, bandsInfo, bandsBalances] = await Promise.all([
        market.stats.balances(),
        market.stats.bandsInfo(),
        market.stats.bandsBalances(),
      ])

      const { activeBand, minBand, maxBand, liquidationBand } = bandsInfo
      const maxMinBands = [maxBand, minBand]

      const bandBalances = liquidationBand ? await market.stats.bandBalances(liquidationBand) : null
      const parsedBandsBalances = await fetchLendChartBandBalancesData(
        sortLendBands(bandsBalances),
        liquidationBand,
        market,
        true,
      )

      return { balances, maxMinBands, activeBand, liquidationBand, bandBalances, bandsBalances: parsedBandsBalances }
      // mint
    } else {
      const [balances, bandsBalances, liquidationBand] = await Promise.all([
        market.stats.balances(),
        market.stats.bandsBalances(),
        market.stats.liquidatingBand(),
      ])

      const parsedBandsBalances = await fetchMintChartBandBalancesData(
        sortMintBands(bandsBalances),
        liquidationBand,
        market,
      )
      // mint
      return {
        balances,
        bandsBalances: parsedBandsBalances,
      }
    }
  },
  validationSuite: llamaApiValidationSuite,
})
