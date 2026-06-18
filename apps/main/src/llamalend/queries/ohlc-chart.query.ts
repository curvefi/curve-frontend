import type { Chain } from '@curvefi/prices-api'
import { getOracle, type Endpoint, type OraclePool } from '@curvefi/prices-api/lending'
import { getOHLC } from '@curvefi/prices-api/llamma'
import type { Address, Token } from '@primitives/address.utils'
import { assert, maybe } from '@primitives/objects.utils'
import { useOhlcInfiniteQuery } from '@ui-kit/features/candle-chart/hooks/useOhlcQueries'
import {
  createCandleChartQueryKey,
  createOhlcPageResult,
  type OhlcPageResult,
} from '@ui-kit/features/candle-chart/query-utils'
import type { LpPriceOhlcDataFormatted, OraclePriceData, TimeOption } from '@ui-kit/features/candle-chart/types'
import { formatCandleOhlcData, formatOraclePriceData } from '@ui-kit/features/candle-chart/utils'
import { t } from '@ui-kit/lib/i18n'

type OhlcTimeUnit = Parameters<typeof getOHLC>[0]['units']

type BaseOhlcQueryParams = {
  endpoint: Endpoint
  chain: Chain | undefined
  interval: number
  timeOption: TimeOption
  units: OhlcTimeUnit
  anchorEnd: number
  enabled?: boolean
}

type OraclePoolOhlcQueryParams = BaseOhlcQueryParams & {
  controller: Address | undefined
}

type LlammaOhlcQueryParams = BaseOhlcQueryParams & {
  llamma: Address | undefined
}

export type OraclePoolOhlcPage = OhlcPageResult & {
  ohlcData: LpPriceOhlcDataFormatted[]
  oraclePriceData: OraclePriceData[]
  borrowedToken?: Token
  collateralToken?: Token
}

export type LlammaOhlcPage = OhlcPageResult & {
  oraclePriceData: OraclePriceData[]
}

// Oracle pools are ordered as the price route from market collateral to borrowed token.
const getOraclePoolTokenPair = (pools: OraclePool[]): Pick<OraclePoolOhlcPage, 'borrowedToken' | 'collateralToken'> => {
  const collateralPool = pools[0]
  const borrowedPool = pools.at(-1)

  return {
    ...maybe(collateralPool, ({ collateralAddress, collateralSymbol }) => ({
      collateralToken: {
        address: collateralAddress,
        symbol: collateralSymbol,
      },
    })),
    ...maybe(borrowedPool, ({ borrowedAddress, borrowedSymbol }) => ({
      borrowedToken: {
        address: borrowedAddress,
        symbol: borrowedSymbol,
      },
    })),
  }
}

export const useOraclePoolOhlcQuery = ({
  endpoint,
  chain,
  controller,
  interval,
  timeOption,
  units,
  anchorEnd,
  enabled = true,
}: OraclePoolOhlcQueryParams) =>
  useOhlcInfiniteQuery({
    queryKey: createCandleChartQueryKey(
      'llamalend',
      'oracle-pool',
      { endpoint },
      { chain },
      { controller },
      { interval },
      { units },
      { timeOption },
      { anchorEnd },
    ),
    anchorEnd,
    timeOption,
    enabled: enabled && !!chain && !!controller,
    fetchPage: async ({ pageParam, signal }): Promise<OraclePoolOhlcPage> => {
      const validChain = assert(chain, t`Cannot fetch oracle-pool OHLC data without a chain.`)
      const { data, pools, ohlc } = await getOracle(
        {
          endpoint,
          chain: validChain,
          controller: controller!,
          interval,
          units,
          start: pageParam.start,
          end: pageParam.end,
        },
        { signal },
      )

      const ohlcData = formatCandleOhlcData(ohlc)
      const oraclePriceData = formatOraclePriceData(data)

      return {
        ohlcData,
        oraclePriceData,
        ...createOhlcPageResult(data),
        ...getOraclePoolTokenPair(pools),
      }
    },
  })

export const useLlammaOhlcQuery = ({
  endpoint,
  chain,
  llamma,
  interval,
  timeOption,
  units,
  anchorEnd,
  enabled = true,
}: LlammaOhlcQueryParams) =>
  useOhlcInfiniteQuery({
    queryKey: createCandleChartQueryKey(
      'llamalend',
      'llamma',
      { endpoint },
      { chain },
      { llamma },
      { interval },
      { units },
      { timeOption },
      { anchorEnd },
    ),
    anchorEnd,
    timeOption,
    enabled: enabled && !!chain && !!llamma,
    fetchPage: async ({ pageParam, signal }): Promise<LlammaOhlcPage> => {
      const validChain = assert(chain, t`Cannot fetch LLAMMA OHLC data without a chain.`)
      const ohlc = await getOHLC(
        {
          endpoint,
          chain: validChain,
          llamma: llamma!,
          interval,
          units,
          start: pageParam.start,
          end: pageParam.end,
        },
        { signal },
      )

      const oraclePriceData = formatOraclePriceData(ohlc)

      return {
        oraclePriceData,
        ...createOhlcPageResult(ohlc),
      }
    },
  })
