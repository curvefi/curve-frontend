import lodash from 'lodash'
import { enforce, group, test } from 'vest'
import type { FetchedBandsBalances } from '@/llamalend/features/bands-chart/types'
import { getLlamaMarket } from '@/llamalend/llama.utils'
import { isLiquidationBand } from '@/llamalend/queries/bands/bands-balances.query-helpers'
import { getPricesImplementation } from '@/llamalend/queries/market/market.query-helpers'
import { liquidationBandValidationGroup } from '@/llamalend/queries/validation/bands-validation'
import type { Decimal } from '@primitives/decimal.utils'
import { BN } from '@ui/utils'
import type { MarketQuery } from '@ui-kit/lib/model'
import { queryFactory, rootKeys } from '@ui-kit/lib/model'
import { marketIdValidationSuite } from '@ui-kit/lib/model/query/market-id-validation'
import { createValidationSuite, FieldsOf } from '@ui-kit/lib/validation'

const QUERY_KEY = 'oracleContextBands' as const

type MarketOracleContextBandsQuery = MarketQuery & {
  liquidationBand: number
  oraclePriceBand: number
  missingBandsKey: string
}
type MarketOracleContextBandsParams = FieldsOf<MarketOracleContextBandsQuery>

const parseMissingBands = (missingBandsKey: string): number[] =>
  lodash.sortBy(lodash.compact(missingBandsKey.split(',')).map(Number))

const marketOracleContextBandsValidationSuite = createValidationSuite(
  ({ oraclePriceBand, missingBandsKey, ...params }: MarketOracleContextBandsParams) => {
    marketIdValidationSuite(params)
    liquidationBandValidationGroup(params)
    group('oraclePriceBandValidation', () => {
      test('oraclePriceBand', () => {
        if (oraclePriceBand != null) {
          enforce(oraclePriceBand).message('Oracle price band must be a number').isNumber()
        }
      })
    })
    group('missingBandsValidation', () => {
      test('missingBandsKey', () => {
        if (missingBandsKey != null) {
          enforce(missingBandsKey).message('Missing bands key must be a string').isString()
        }
      })
    })
  },
)

/**
 * Loads only the missing oracle-neighborhood bands (N-1, N, N+1) for the bands chart.
 *
 * Why this exists:
 * - The main market bands query intentionally stays lean and does not include synthetic zero-balance rows.
 * - The chart still needs oracle-context rows to render the current oracle area even when those bands have no balances.
 */
export const { useQuery: useMarketOracleContextBands } = queryFactory({
  queryKey: ({
    chainId,
    marketId,
    oraclePriceBand,
    liquidationBand,
    missingBandsKey,
  }: MarketOracleContextBandsParams) =>
    [
      ...rootKeys.market({ chainId, marketId }),
      QUERY_KEY,
      { oraclePriceBand },
      { liquidationBand },
      { missingBandsKey },
    ] as const,
  queryFn: async ({ marketId, liquidationBand, missingBandsKey }: MarketOracleContextBandsQuery) => {
    const missingBands = parseMissingBands(missingBandsKey)
    if (missingBands.length === 0) return []

    const market = getLlamaMarket(marketId)
    const prices = getPricesImplementation(market)

    return Promise.all(
      missingBands.map(async (band): Promise<FetchedBandsBalances> => {
        const [p_up, p_down] = await prices.calcBandPrices(band)
        const pUpDownMedian = Number(new BN(p_up).plus(p_down).dividedBy(2))

        return {
          borrowed: '0' as Decimal,
          collateral: '0' as Decimal,
          collateralUsd: 0,
          collateralBorrowedUsd: 0,
          isLiquidationBand: isLiquidationBand(liquidationBand, band),
          n: band,
          p_up: Number(p_up),
          p_down: Number(p_down),
          pUpDownMedian,
        }
      }),
    )
  },
  category: 'llamalend.market',
  validationSuite: marketOracleContextBandsValidationSuite,
})
