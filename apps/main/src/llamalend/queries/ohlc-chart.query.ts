import { getAddress } from 'ethers'
import type { Chain } from '@curvefi/prices-api'
import { getOracle, type Endpoint, type OraclePool } from '@curvefi/prices-api/lending'
import { getOHLC } from '@curvefi/prices-api/llamma'
import type { Address } from '@primitives/address.utils'
import {
  assertInitialOhlcPageHasData,
  createCandleChartQueryKey,
  createOhlcPageResult,
  formatCandleOhlcData,
  formatOraclePriceData,
  type OhlcPageParam,
  type OhlcPageResult,
  useOhlcInfiniteQuery,
} from '@ui-kit/features/candle-chart/query-utils'
import type { LpPriceOhlcDataFormatted, OraclePriceData, TimeOption } from '@ui-kit/features/candle-chart/types'

type OhlcTimeUnit = Parameters<typeof getOHLC>[0]['units']

type TokenInfo = {
  address: OraclePool['borrowedAddress'] | OraclePool['collateralAddress']
  symbol: OraclePool['borrowedSymbol'] | OraclePool['collateralSymbol']
}

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
  controller: string
}

type LlammaOhlcQueryParams = BaseOhlcQueryParams & {
  llamma: string
}

export type OraclePoolOhlcPage = OhlcPageResult & {
  page: OhlcPageParam
  ohlcData: LpPriceOhlcDataFormatted[]
  oraclePriceData: OraclePriceData[]
  borrowedToken?: TokenInfo
  collateralToken?: TokenInfo
}

export type LlammaOhlcPage = OhlcPageResult & {
  page: OhlcPageParam
  oraclePriceData: OraclePriceData[]
}

// Oracle pools are ordered as the price route from market collateral to borrowed token.
const getOraclePoolTokenPair = (pools: OraclePool[]): Pick<OraclePoolOhlcPage, 'borrowedToken' | 'collateralToken'> => {
  const collateralPool = pools[0]
  const borrowedPool = pools.at(-1)

  return {
    ...(collateralPool
      ? {
          collateralToken: {
            address: collateralPool.collateralAddress,
            symbol: collateralPool.collateralSymbol,
          },
        }
      : {}),
    ...(borrowedPool
      ? {
          borrowedToken: {
            address: borrowedPool.borrowedAddress,
            symbol: borrowedPool.borrowedSymbol,
          },
        }
      : {}),
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
      if (!chain) {
        throw new Error('Cannot fetch oracle-pool OHLC data without a chain.')
      }

      const page = pageParam
      const { data, pools, ohlc } = await getOracle(
        {
          endpoint,
          chain,
          controller: getAddress(controller) as Address,
          interval,
          units,
          start: page.start,
          end: page.end,
        },
        { signal },
      )

      assertInitialOhlcPageHasData({
        anchorEnd,
        dataLength: data.length,
        message: 'No oracle OHLC data found. Data may be unavailable for this pool.',
        page,
      })

      const ohlcData = formatCandleOhlcData(ohlc)
      const oraclePriceData = formatOraclePriceData(data)

      return {
        page,
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
      if (!chain) {
        throw new Error('Cannot fetch LLAMMA OHLC data without a chain.')
      }

      const page = pageParam
      const ohlc = await getOHLC(
        {
          endpoint,
          chain,
          llamma: llamma as Address,
          interval,
          units,
          start: page.start,
          end: page.end,
        },
        { signal },
      )

      assertInitialOhlcPageHasData({
        anchorEnd,
        dataLength: ohlc.length,
        message: 'No LLAMMA OHLC data found. Data may be unavailable for this pool.',
        page,
      })

      const oraclePriceData = formatOraclePriceData(ohlc)

      return {
        page,
        oraclePriceData,
        ...createOhlcPageResult(ohlc),
      }
    },
  })
