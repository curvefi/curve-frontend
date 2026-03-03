import { getLlamaMarket } from '@/llamalend/llama.utils'
import { LendMarketTemplate } from '@curvefi/llamalend-api/lib/lendMarkets'
import { BN } from '@ui/utils'
import type { MarketQuery } from '@ui-kit/lib/model'
import { queryFactory, rootKeys } from '@ui-kit/lib/model'
import { marketIdValidationSuite } from '@ui-kit/lib/model/query/market-id-validation'
import { createValidationSuite, FieldsOf } from '@ui-kit/lib/validation'
import { sortBands, fetchChartBandBalancesData } from './utils'
import { liquidationBandValidationGroup, oraclePriceBandValidationGroup } from './validation'

const isMarket = true

type MarketBandsBalancesQuery = MarketQuery & {
  liquidationBand: number
  oraclePriceBand: number
}
type MarketBandsBalancesParams = FieldsOf<MarketBandsBalancesQuery>

export const marketBandsBalancesValidationSuite = createValidationSuite((params: MarketBandsBalancesParams) => {
  marketIdValidationSuite(params)
  liquidationBandValidationGroup(params)
  oraclePriceBandValidationGroup(params)
})

export const { useQuery: useMarketBandsBalances } = queryFactory({
  queryKey: ({ chainId, marketId, liquidationBand, oraclePriceBand }: MarketBandsBalancesParams) =>
    [
      ...rootKeys.market({ chainId, marketId }),
      'market-bands-balances',
      { liquidationBand },
      { oraclePriceBand },
    ] as const,
  queryFn: async ({ marketId, liquidationBand, oraclePriceBand }: MarketBandsBalancesQuery) => {
    const market = getLlamaMarket(marketId)
    const normalizedLiquidationBand = liquidationBand ?? null
    const normalizedOraclePriceBand = oraclePriceBand ?? null

    let data
    // lend
    if (market instanceof LendMarketTemplate) {
      const bandsBalances = await market.stats.bandsBalances()
      data = await fetchChartBandBalancesData(sortBands(bandsBalances), normalizedLiquidationBand, market, isMarket)
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
      data = await fetchChartBandBalancesData(
        sortBands(formattedBandsBalances),
        normalizedLiquidationBand,
        market,
        isMarket,
      )
    }

    // Ensure oracle band and a small neighborhood around it are present (inline)
    if (typeof normalizedOraclePriceBand === 'number') {
      for (const offset of [-1, 0, 1]) {
        const band = normalizedOraclePriceBand + offset
        if (!Number.isFinite(band) || data.some((b) => b.n === band)) continue
        const [p_up, p_down] = await market.calcBandPrices(+band)
        const pUpDownMedian = Number(new BN(p_up).plus(p_down).dividedBy(2))
        data.push({
          borrowed: '0',
          collateral: '0',
          collateralUsd: 0,
          collateralBorrowedUsd: 0,
          isLiquidationBand: normalizedLiquidationBand ? (normalizedLiquidationBand === +band ? 'SL' : '') : '',
          n: band,
          p_up: Number(p_up),
          p_down: Number(p_down),
          pUpDownMedian,
        })
      }
    }

    return data
  },
  category: 'llamalend.market',
  validationSuite: marketBandsBalancesValidationSuite,
})
