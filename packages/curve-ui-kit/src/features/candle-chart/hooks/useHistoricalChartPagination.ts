import type { IChartApi, ISeriesApi, Time } from 'lightweight-charts'
import { debounce } from 'lodash'
import { useCallback, useEffect, useMemo, useRef, type RefObject } from 'react'
import type { LpPriceOhlcDataFormatted, OraclePriceData } from '../types'
import { useLatestValueRef } from './useLatestValueRef'

type PaginationSeriesApi = ISeriesApi<'Candlestick'> | ISeriesApi<'Line'>
type VisibleTimeRange = { from: Time; to: Time }

type UseHistoricalChartPaginationParams = {
  candlestickSeriesRef: RefObject<ISeriesApi<'Candlestick'> | null>
  chartRef: RefObject<IChartApi | null>
  fetchMoreChartData: () => Promise<unknown>
  ohlcData: LpPriceOhlcDataFormatted[]
  oraclePriceData?: OraclePriceData[]
  oraclePriceSeriesRef: RefObject<ISeriesApi<'Line'> | null>
}

const HISTORICAL_PAGE_THRESHOLD_BARS = 50
const HISTORICAL_FETCH_DEBOUNCE_MS = 500

const shouldFetchHistoricalPage = (barsInfo: { barsBefore: number } | null) =>
  !!barsInfo && barsInfo.barsBefore < HISTORICAL_PAGE_THRESHOLD_BARS

const getHistoricalPaginationDataLength = (ohlcData: LpPriceOhlcDataFormatted[], oraclePriceData?: OraclePriceData[]) =>
  ohlcData.length || (oraclePriceData?.length ?? 0)

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

    let request: Promise<unknown>
    try {
      request = fetchMoreChartDataRef.current()
    } catch {
      pendingVisibleRangeRef.current = null
      historicalFetchInFlightRef.current = false
      return
    }

    void request
      .catch(() => {
        pendingVisibleRangeRef.current = null
      })
      .finally(() => {
        historicalFetchInFlightRef.current = false
      })
  }, [fetchMoreChartDataRef])

  const debouncedFetchHistoricalPage = useMemo(
    () => debounce(fetchHistoricalPage, HISTORICAL_FETCH_DEBOUNCE_MS, { leading: true, trailing: false }),
    [fetchHistoricalPage],
  )

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

  useEffect(
    () => () => {
      debouncedFetchHistoricalPage.cancel()
    },
    [debouncedFetchHistoricalPage],
  )

  const getPaginationSeries = useCallback((): PaginationSeriesApi | null => {
    if (ohlcDataRef.current.length > 0 && candlestickSeriesRef.current) {
      return candlestickSeriesRef.current
    }

    if (oraclePriceDataRef.current?.length && oraclePriceSeriesRef.current) {
      return oraclePriceSeriesRef.current
    }

    return null
  }, [candlestickSeriesRef, ohlcDataRef, oraclePriceDataRef, oraclePriceSeriesRef])

  const handleVisibleLogicalRangeChange = useCallback(() => {
    if (!chartRef.current) {
      return
    }

    const paginationSeries = getPaginationSeries()
    if (!paginationSeries) return

    const timeScale = chartRef.current.timeScale()
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
      debouncedFetchHistoricalPage()
    }
  }, [chartRef, debouncedFetchHistoricalPage, getPaginationSeries])

  return {
    handleVisibleLogicalRangeChange,
    restoreVisibleRangeAfterDataUpdate,
  }
}
