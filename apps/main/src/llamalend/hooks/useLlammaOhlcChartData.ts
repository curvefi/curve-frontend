import { useCallback, useMemo } from 'react'
import type { Chain } from '@curvefi/prices-api'
import { notFalsy } from '@primitives/objects.utils'
import {
  applyLatestOraclePrice,
  fetchMoreOhlcQueries,
  flattenOhlcPages,
  refetchOhlcQueries,
  useOhlcPagesAdapter,
  useOhlcQueryAdapter,
} from '@ui-kit/features/candle-chart'
import type { TimeOption } from '@ui-kit/features/candle-chart/types'
import {
  type LlammaOhlcPage,
  type OraclePoolOhlcPage,
  useLlammaOhlcQuery,
  useOraclePoolOhlcQuery,
} from '../queries/ohlc-chart.query'

type OhlcTimeUnit = Parameters<typeof useLlammaOhlcQuery>[0]['units']
type Endpoint = Parameters<typeof useLlammaOhlcQuery>[0]['endpoint']
type HistoricalSelection = {
  oraclePool: boolean
  llamma: boolean
}

type UseLlammaOhlcChartDataParams = {
  anchorEnd: number
  chain: Chain | undefined
  controller: string
  enabled?: boolean
  endpoint: Endpoint
  interval: number
  llamma: string
  oraclePrice: string | undefined
  timeOption: TimeOption
  units: OhlcTimeUnit
}

const selectOraclePoolOhlcData = (page: OraclePoolOhlcPage) => page.ohlcData
const selectOraclePoolOraclePriceData = (page: OraclePoolOhlcPage) => page.oraclePriceData
const selectLlammaOraclePriceData = (page: LlammaOhlcPage) => page.oraclePriceData
const selectOraclePoolChartData = (pages: OraclePoolOhlcPage[] | undefined) => ({
  ohlcData: flattenOhlcPages(pages, selectOraclePoolOhlcData),
  oraclePriceData: flattenOhlcPages(pages, selectOraclePoolOraclePriceData),
})

export const useLlammaOhlcChartData = ({
  anchorEnd,
  chain,
  controller,
  enabled = true,
  endpoint,
  interval,
  llamma,
  oraclePrice,
  timeOption,
  units,
}: UseLlammaOhlcChartDataParams) => {
  const oraclePoolQuery = useOraclePoolOhlcQuery({
    endpoint,
    chain,
    controller,
    interval,
    timeOption,
    units,
    anchorEnd,
    enabled,
  })
  const oraclePool = useOhlcPagesAdapter({
    query: oraclePoolQuery,
    selectData: selectOraclePoolChartData,
  })
  const oraclePoolIsSettled = oraclePoolQuery.isSuccess || oraclePoolQuery.isError
  const oraclePoolHasOraclePriceData = oraclePool.data.oraclePriceData.length > 0
  const shouldFetchLlammaQuery = enabled && !!llamma && oraclePoolIsSettled && !oraclePoolHasOraclePriceData
  const llammaQuery = useLlammaOhlcQuery({
    endpoint,
    chain,
    llamma,
    interval,
    timeOption,
    units,
    anchorEnd,
    enabled: shouldFetchLlammaQuery,
  })
  const rawLlammaOraclePrice = useOhlcQueryAdapter({
    query: llammaQuery,
    selectItems: selectLlammaOraclePriceData,
  })
  const llammaOraclePriceData = useMemo(
    () => applyLatestOraclePrice(rawLlammaOraclePrice.data, oraclePrice),
    [oraclePrice, rawLlammaOraclePrice.data],
  )
  const oracleTokenPage = oraclePoolQuery.data?.pages.find(
    page => page.collateralToken.symbol && page.borrowedToken.symbol,
  )
  const oracleTokens = useMemo(
    () =>
      oracleTokenPage
        ? {
            collateralSymbol: oracleTokenPage.collateralToken.symbol,
            borrowedSymbol: oracleTokenPage.borrowedToken.symbol,
          }
        : null,
    [oracleTokenPage],
  )
  const selectHistoricalQueries = useCallback(
    (selection: HistoricalSelection) =>
      notFalsy(selection.oraclePool && oraclePoolQuery, selection.llamma && shouldFetchLlammaQuery && llammaQuery),
    [llammaQuery, oraclePoolQuery, shouldFetchLlammaQuery],
  )

  const refetch = useCallback(
    (selection: HistoricalSelection) => refetchOhlcQueries(selectHistoricalQueries(selection)),
    [selectHistoricalQueries],
  )

  const fetchMore = useCallback(
    (selection: HistoricalSelection) => fetchMoreOhlcQueries(selectHistoricalQueries(selection)),
    [selectHistoricalQueries],
  )

  return {
    fetchMore,
    llammaFallback: {
      error: rawLlammaOraclePrice.error,
      isLoading: rawLlammaOraclePrice.isLoading,
      oraclePriceData: llammaOraclePriceData,
    },
    oraclePool: {
      error: oraclePool.error,
      isLoading: oraclePool.isLoading,
      ohlcData: oraclePool.data.ohlcData,
      oraclePriceData: oraclePool.data.oraclePriceData,
    },
    oracleTokens,
    refetch,
  }
}
