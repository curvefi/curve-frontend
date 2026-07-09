import type { IChartApi, ISeriesApi, Time } from 'lightweight-charts'
import { useCallback, useRef, type RefObject } from 'react'
import { useLatestValueRef } from '../../../hooks/useLatestValueRef'
import type { LpPriceOhlcDataFormatted, OraclePriceData } from '../types'

type VisibleTimeRange = { from: Time; to: Time }

type UseHistoricalChartPaginationParams = {
  candlestickSeriesRef: RefObject<ISeriesApi<'Candlestick'> | null>
  chartRef: RefObject<IChartApi | null>
  fetchMoreChartData: () => Promise<unknown>
  ohlcData: LpPriceOhlcDataFormatted[] | undefined
  oraclePriceData?: OraclePriceData[]
  oraclePriceSeriesRef: RefObject<ISeriesApi<'Line'> | null>
}

const HISTORICAL_PAGE_THRESHOLD_BARS = 50

const shouldFetchHistoricalPage = (barsInfo: { barsBefore: number } | null) =>
  !!barsInfo && barsInfo.barsBefore < HISTORICAL_PAGE_THRESHOLD_BARS

const getHistoricalPaginationDataLength = (
  ohlcData: LpPriceOhlcDataFormatted[] | undefined,
  oraclePriceData?: OraclePriceData[],
) => (ohlcData?.length || oraclePriceData?.length) ?? 0

export const useHistoricalChartPagination = ({
  candlestickSeriesRef,
  chartRef,
  fetchMoreChartData,
  ohlcData,
  oraclePriceData,
  oraclePriceSeriesRef,
}: UseHistoricalChartPaginationParams) => {
  const ohlcDataRef = useLatestValueRef(ohlcData)
  const oraclePriceDataRef = useLatestValueRef(oraclePriceData)
  const fetchMoreChartDataRef = useLatestValueRef(fetchMoreChartData)
  // lightweight-charts emits many imperative range events during a drag. Refs
  // keep that hot path out of React render state while still guarding the
  // network boundary and the viewport we need to restore after prepend.
  const historicalFetchInFlightRef = useRef(false)
  const pendingVisibleRangeRef = useRef<VisibleTimeRange | null>(null)
  const paginationDataLengthRef = useRef(getHistoricalPaginationDataLength(ohlcData, oraclePriceData))

  const fetchHistoricalPage = useCallback(() => {
    if (historicalFetchInFlightRef.current) return

    historicalFetchInFlightRef.current = true

    void fetchMoreChartDataRef.current().finally(() => {
      historicalFetchInFlightRef.current = false
    })
  }, [fetchMoreChartDataRef])

  const restoreVisibleRangeAfterDataUpdate = useCallback(() => {
    const nextDataLength = getHistoricalPaginationDataLength(ohlcDataRef.current, oraclePriceDataRef.current)
    const previousDataLength = paginationDataLengthRef.current
    const pendingVisibleRange = pendingVisibleRangeRef.current

    paginationDataLengthRef.current = nextDataLength
    pendingVisibleRangeRef.current = null

    if (nextDataLength < previousDataLength) {
      historicalFetchInFlightRef.current = false
      return
    }

    if (!chartRef.current || !pendingVisibleRange || nextDataLength <= previousDataLength) return

    // Older history is prepended, which shifts logical bar indices. Restore
    // the user's viewport after setData applies the new points; doing it
    // before setData lets the prepend move the x-axis back in time.
    chartRef.current.timeScale().setVisibleRange(pendingVisibleRange)
  }, [chartRef, ohlcDataRef, oraclePriceDataRef])

  const handleVisibleLogicalRangeChange = useCallback(() => {
    const chart = chartRef.current
    if (!chart) return

    const candlestickSeries = candlestickSeriesRef.current
    const oraclePriceSeries = oraclePriceSeriesRef.current
    const hasCandlestickData = !!ohlcDataRef.current?.length
    const hasOraclePriceData = Boolean(oraclePriceDataRef.current?.length)
    const paginationSeries =
      hasCandlestickData && candlestickSeries
        ? candlestickSeries
        : hasOraclePriceData && oraclePriceSeries
          ? oraclePriceSeries
          : null
    if (!paginationSeries) return

    const timeScale = chart.timeScale()
    const logicalRange = timeScale.getVisibleLogicalRange()

    if (!logicalRange) {
      return
    }

    const visibleRange = timeScale.getVisibleRange()
    if (!visibleRange) return

    if (historicalFetchInFlightRef.current) {
      pendingVisibleRangeRef.current = visibleRange
      return
    }

    const barsInfo = paginationSeries.barsInLogicalRange(logicalRange)
    if (shouldFetchHistoricalPage(barsInfo)) {
      pendingVisibleRangeRef.current = visibleRange
      fetchHistoricalPage()
    }
  }, [candlestickSeriesRef, chartRef, fetchHistoricalPage, ohlcDataRef, oraclePriceDataRef, oraclePriceSeriesRef])

  return {
    handleVisibleLogicalRangeChange,
    restoreVisibleRangeAfterDataUpdate,
  }
}
