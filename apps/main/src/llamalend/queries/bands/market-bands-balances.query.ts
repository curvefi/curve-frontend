import { getMarket } from '@/llamalend/llama.utils'
import { fetchChartBandBalancesData, sortBands } from '@/llamalend/queries/bands/bands-balances.query-helpers'
import { normalizeBands } from '@/llamalend/queries/market/market.query-helpers'
import { liquidationBandValidationGroup } from '@/llamalend/queries/validation/bands-validation'
import type { MarketQuery } from '@evm-ui/lib/model'
import { queryFactory, rootKeys } from '@evm-ui/lib/model'
import { marketIdValidationSuite } from '@evm-ui/lib/model/query/market-id-validation'
import { createValidationSuite, FieldsOf } from '@evm-ui/lib/validation'

const IS_MARKET = true
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
    const market = getMarket(marketId)
    const normalizedLiquidationBand = liquidationBand ?? null
    return fetchChartBandBalancesData(
      sortBands(normalizeBands(await market.stats.bandsBalances())),
      normalizedLiquidationBand,
      market,
      IS_MARKET,
    )
  },
  category: 'llamalend.market',
  validationSuite: marketBandsBalancesValidationSuite,
})
