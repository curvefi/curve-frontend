import { getLlamaMarket } from '@/llamalend/llama.utils'
import { LendMarketTemplate } from '@curvefi/llamalend-api/lib/lendMarkets'
import type { MarketQuery, MarketParams } from '@ui-kit/lib/model'
import { queryFactory, rootKeys } from '@ui-kit/lib/model'
import { llamaApiValidationSuite } from '@ui-kit/lib/model/query/curve-api-validation'
import type { BandsBalances } from '../types'
import { sortBands, fetchChartBandBalancesData } from './utils'

const isMarket = true

export const { useQuery: useMarketBands } = queryFactory({
  queryKey: ({ chainId, marketId }: MarketParams) =>
    [...rootKeys.market({ chainId, marketId }), 'market-bands'] as const,
  queryFn: async ({ marketId }: MarketQuery) => {
    const market = getLlamaMarket(marketId)

    let liquidationBand: number | null
    let bandsBalances: BandsBalances

    // lend
    if (market instanceof LendMarketTemplate) {
      const [bandsInfo, rawBandsBalances] = await Promise.all([market.stats.bandsInfo(), market.stats.bandsBalances()])
      liquidationBand = bandsInfo.liquidationBand
      bandsBalances = rawBandsBalances
      // mint
    } else {
      const [rawBandsBalances, band] = await Promise.all([market.stats.bandsBalances(), market.stats.liquidatingBand()])
      liquidationBand = band
      bandsBalances = Object.fromEntries(
        Object.entries(rawBandsBalances).map(([key, value]) => [
          key,
          { borrowed: value.stablecoin, collateral: value.collateral },
        ]),
      )
    }

    const parsedBandsBalances = await fetchChartBandBalancesData(
      sortBands(bandsBalances),
      liquidationBand,
      market,
      isMarket,
    )

    return { liquidationBand, bandsBalances: parsedBandsBalances }
  },
  validationSuite: llamaApiValidationSuite,
})
