import { getLlamaMarket } from '@/llamalend/llama.utils'
import { fetchChartBandBalancesData, sortBands } from '@/llamalend/queries/bands/bands-balances.query-helpers'
import { normalizeBands } from '@/llamalend/queries/market/market.query-helpers'
import { liquidationBandValidationGroup } from '@/llamalend/queries/validation/bands-validation'
import { queryClient } from '@ui-kit/lib/api/query-client'
import type { MarketParams, MarketQuery } from '@ui-kit/lib/model'
import { queryFactory, rootKeys } from '@ui-kit/lib/model'
import { marketIdValidationSuite } from '@ui-kit/lib/model/query/market-id-validation'
import { createValidationSuite, FieldsOf } from '@ui-kit/lib/validation'

const isMarket = true
const QUERY_KEY = 'bandsBalances' as const

type MarketBandsBalancesQuery = MarketQuery & {
  liquidationBand: number
}
type MarketBandsBalancesParams = FieldsOf<MarketBandsBalancesQuery>

const marketBandsBalancesValidationSuite = createValidationSuite((params: MarketBandsBalancesParams) => {
  marketIdValidationSuite(params)
  liquidationBandValidationGroup(params)
})

export const { useQuery: useMarketBandsBalances } = queryFactory({
  queryKey: ({ chainId, marketId, liquidationBand }: MarketBandsBalancesParams) =>
    [...rootKeys.market({ chainId, marketId }), QUERY_KEY, { liquidationBand }] as const,
  queryFn: async ({ marketId, liquidationBand }: MarketBandsBalancesQuery) => {
    const market = getLlamaMarket(marketId)
    const normalizedLiquidationBand = liquidationBand ?? null
    return fetchChartBandBalancesData(
      sortBands(normalizeBands(await market.stats.bandsBalances())),
      normalizedLiquidationBand,
      market,
      isMarket,
    )
  },
  category: 'llamalend.market',
  validationSuite: marketBandsBalancesValidationSuite,
})

/**
 * Prefix-based invalidation because the query key includes extra params (liquidationBand)
 * that aren't available at invalidation time. Band balances can change even when those params stay the same.
 */
export const invalidateMarketBandsBalances = ({ chainId, marketId }: MarketParams) =>
  queryClient.invalidateQueries({ queryKey: [...rootKeys.market({ chainId, marketId }), QUERY_KEY] })
