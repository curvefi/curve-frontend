import { getLlamaMarket } from '@/llamalend/llama.utils'
import { normalizeBands, getPricesImplementation } from '@/llamalend/queries/market/market.query-helpers'
import { BN } from '@ui/utils'
import type { MarketQuery } from '@ui-kit/lib/model'
import { queryFactory, rootKeys } from '@ui-kit/lib/model'
import { marketIdValidationSuite } from '@ui-kit/lib/model/query/market-id-validation'
import { createValidationSuite, FieldsOf } from '@ui-kit/lib/validation'
import { fetchChartBandBalancesData, sortBands } from './utils'
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
    [...rootKeys.market({ chainId, marketId }), 'bandsBalances', { liquidationBand }, { oraclePriceBand }] as const,
  queryFn: async ({ marketId, liquidationBand, oraclePriceBand }: MarketBandsBalancesQuery) => {
    const market = getLlamaMarket(marketId)
    const normalizedLiquidationBand = liquidationBand ?? null
    const normalizedOraclePriceBand = oraclePriceBand ?? null

    const data = await fetchChartBandBalancesData(
      sortBands(normalizeBands(await market.stats.bandsBalances())),
      normalizedLiquidationBand,
      market,
      isMarket,
    )

    if (normalizedOraclePriceBand == null) return data

    // Ensure oracle band and a small neighborhood around it are present (inline)
    for (const offset of [-1, 0, 1]) {
      const band = normalizedOraclePriceBand + offset
      if (!Number.isFinite(band) || data.some((b) => b.n === band)) continue
      const [p_up, p_down] = await getPricesImplementation(market).calcBandPrices(+band)
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
    return data
  },
  category: 'llamalend.market',
  validationSuite: marketBandsBalancesValidationSuite,
})
