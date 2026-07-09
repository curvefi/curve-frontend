import { useCallback, useMemo } from 'react'
import type { Chain } from '@curvefi/prices-api'
import type { Address } from '@primitives/address.utils'
import { notFalsy, maybe, maybes } from '@primitives/objects.utils'
import {
  fetchMoreOhlcQueries,
  refetchOhlcQueries,
  useOhlcPagesAdapter,
  useOhlcQueryAdapter,
} from '@ui-kit/features/candle-chart/hooks/useOhlcQueries'
import type { TimeOption } from '@ui-kit/features/candle-chart/types'
import { applyLatestOraclePrice, flattenOhlcPagesChronologically } from '@ui-kit/features/candle-chart/utils'
import { q, useMappedQuery } from '@ui-kit/types/util'
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
  controller: Address | undefined
  enabled?: boolean
  endpoint: Endpoint
  interval: number
  llamma: Address | undefined
  oraclePrice: string | undefined
  timeOption: TimeOption
  units: OhlcTimeUnit
}

const selectOraclePoolOhlcData = (page: OraclePoolOhlcPage) => page.ohlcData
const selectOraclePoolOraclePriceData = (page: OraclePoolOhlcPage) => page.oraclePriceData
const selectLlammaOraclePriceData = (page: LlammaOhlcPage) => page.oraclePriceData
const selectOraclePoolChartData = (pages: OraclePoolOhlcPage[] | undefined) => ({
  ohlcData: flattenOhlcPagesChronologically(pages, selectOraclePoolOhlcData),
  oraclePriceData: flattenOhlcPagesChronologically(pages, selectOraclePoolOraclePriceData),
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
  const oraclePoolsChartAdapter = useOhlcPagesAdapter({
    query: oraclePoolQuery,
    selectData: selectOraclePoolChartData,
  })
  const oraclePoolIsSettled = oraclePoolQuery.isSuccess || oraclePoolQuery.isError
  const oraclePoolsHaveOraclePriceData = !!oraclePoolsChartAdapter.data.oraclePriceData?.length
  const oraclePoolsHaveChartData = !!oraclePoolsChartAdapter.data.ohlcData?.length || oraclePoolsHaveOraclePriceData
  const shouldFetchLlammaQuery = enabled && !!llamma && oraclePoolIsSettled && !oraclePoolsHaveOraclePriceData
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
  const rawOraclePriceFallback = useOhlcQueryAdapter({
    query: llammaQuery,
    selectItems: selectLlammaOraclePriceData,
  })
  const isWaitingForFallbackChartData =
    !oraclePoolsHaveChartData && shouldFetchLlammaQuery && rawOraclePriceFallback.isLoading
  const oraclePriceFallbackQuery = useMappedQuery(
    rawOraclePriceFallback,
    useCallback(data => applyLatestOraclePrice(data, maybe(oraclePrice, Number)), [oraclePrice]),
  )
  const oracleTokenPage = oraclePoolQuery.data?.pages.find(
    page => page.collateralToken?.symbol && page.borrowedToken?.symbol,
  )
  const oracleTokens = useMemo(
    () =>
      maybes([oracleTokenPage?.collateralToken, oracleTokenPage?.borrowedToken], (collateralToken, borrowedToken) => ({
        collateralSymbol: collateralToken.symbol,
        borrowedSymbol: borrowedToken.symbol,
      })),
    [oracleTokenPage],
  )
  const refetch = useCallback(
    (selection: HistoricalSelection) =>
      refetchOhlcQueries(
        notFalsy(
          selection.oraclePool && oraclePoolQuery.refetch,
          selection.llamma && shouldFetchLlammaQuery && llammaQuery.refetch,
        ),
      ),
    [llammaQuery.refetch, oraclePoolQuery.refetch, shouldFetchLlammaQuery],
  )

  const fetchMore = useCallback(
    (selection: HistoricalSelection) =>
      fetchMoreOhlcQueries(
        notFalsy(
          selection.oraclePool && {
            fetchNextPage: oraclePoolQuery.fetchNextPage,
            hasNextPage: oraclePoolQuery.hasNextPage,
            isFetchingNextPage: oraclePoolQuery.isFetchingNextPage,
            isSuccess: oraclePoolQuery.isSuccess,
          },
          selection.llamma &&
            shouldFetchLlammaQuery && {
              fetchNextPage: llammaQuery.fetchNextPage,
              hasNextPage: llammaQuery.hasNextPage,
              isFetchingNextPage: llammaQuery.isFetchingNextPage,
              isSuccess: llammaQuery.isSuccess,
            },
        ),
      ),
    [
      llammaQuery.fetchNextPage,
      llammaQuery.hasNextPage,
      llammaQuery.isFetchingNextPage,
      llammaQuery.isSuccess,
      oraclePoolQuery.fetchNextPage,
      oraclePoolQuery.hasNextPage,
      oraclePoolQuery.isFetchingNextPage,
      oraclePoolQuery.isSuccess,
      shouldFetchLlammaQuery,
    ],
  )

  return {
    fetchMore,
    isWaitingForFallbackChartData,
    isLlammaFallbackEnabled: shouldFetchLlammaQuery,
    oraclePriceFallbackQuery,
    oraclePoolsChartQuery: q(oraclePoolsChartAdapter),
    oracleTokens,
    refetch,
  }
}
