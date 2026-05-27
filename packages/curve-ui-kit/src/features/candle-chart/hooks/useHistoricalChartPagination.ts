import type { IChartApi, ISeriesApi, Time } from 'lightweight-charts'
import { debounce } from 'lodash'
import { useCallback, useEffect, useMemo, useRef, type RefObject } from 'react'
import type { LpPriceOhlcDataFormatted, OraclePriceData } from '../types'
import { useLatestValueRef } from './useLatestValueRef'

type PaginationSeriesApi = ISeriesApi<'Candlestick'> | ISeriesApi<'Line'>
type VisibleTimeRange = { from: Time; to: Time }
type HistoricalDataUpdate = {
  nextDataLength: number
  pendingVisibleRange: VisibleTimeRange | null
  resetInFlight: boolean
  visibleRangeToRestore: VisibleTimeRange | null
}

type UseHistoricalChartPaginationParams = {
  candlestickSeriesRef: RefObject<ISeriesApi<'Candlestick'> | null>
  chartRef: RefObject<IChartApi | null>
  fetchMoreChartData: () => Promise<unknown> | undefined
  ohlcData: LpPriceOhlcDataFormatted[]
  oraclePriceData?: OraclePriceData[]
  oraclePriceSeriesRef: RefObject<ISeriesApi<'Line'> | null>
}

const HISTORICAL_PAGE_THRESHOLD_BARS = 50
const HISTORICAL_FETCH_DEBOUNCE_MS = 500

const shouldFetchHistoricalPage = (barsInfo: { barsBefore: number } | null) =>
  !!barsInfo && barsInfo.barsBefore < HISTORICAL_PAGE_THRESHOLD_BARS

export const getHistoricalPaginationDataLength = (
  ohlcData: LpPriceOhlcDataFormatted[],
  oraclePriceData?: OraclePriceData[],
) => (ohlcData.length > 0 ? ohlcData.length : (oraclePriceData?.length ?? 0))

export const startHistoricalPageFetch = ({
  fetchMoreChartData,
  isFetchInFlight,
  onRequestRejected,
  onRequestSettled,
  onRequestStarted,
  onRequestUnavailable,
}: {
  fetchMoreChartData: () => Promise<unknown> | undefined
  isFetchInFlight: boolean
  onRequestRejected: () => void
  onRequestSettled: () => void
  onRequestStarted: () => void
  onRequestUnavailable: () => void
}) => {
  if (isFetchInFlight) return

  onRequestStarted()
  let request: Promise<unknown> | undefined
  try {
    request = fetchMoreChartData()
  } catch {
    onRequestRejected()
    onRequestSettled()
    return
  }

  if (!request) {
    onRequestUnavailable()
    onRequestSettled()
    return
  }

  void request.catch(onRequestRejected).finally(onRequestSettled)
}

export const resolveHistoricalDataUpdate = ({
  nextDataLength,
  pendingVisibleRange,
  previousDataLength,
}: {
  nextDataLength: number
  pendingVisibleRange: VisibleTimeRange | null
  previousDataLength: number
}): HistoricalDataUpdate => {
  if (nextDataLength < previousDataLength) {
    return {
      nextDataLength,
      pendingVisibleRange: null,
      resetInFlight: true,
      visibleRangeToRestore: null,
    }
  }

  if (!pendingVisibleRange) {
    return {
      nextDataLength,
      pendingVisibleRange: null,
      resetInFlight: false,
      visibleRangeToRestore: null,
    }
  }

  if (nextDataLength <= previousDataLength) {
    return {
      nextDataLength,
      pendingVisibleRange: null,
      resetInFlight: false,
      visibleRangeToRestore: null,
    }
  }

  return {
    nextDataLength,
    pendingVisibleRange: null,
    resetInFlight: false,
    visibleRangeToRestore: pendingVisibleRange,
  }
}

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
    startHistoricalPageFetch({
      fetchMoreChartData: fetchMoreChartDataRef.current,
      isFetchInFlight: historicalFetchInFlightRef.current,
      onRequestRejected: () => {
        pendingVisibleRangeRef.current = null
      },
      onRequestSettled: () => {
        historicalFetchInFlightRef.current = false
      },
      onRequestStarted: () => {
        historicalFetchInFlightRef.current = true
      },
      onRequestUnavailable: () => {
        pendingVisibleRangeRef.current = null
      },
    })
  }, [fetchMoreChartDataRef])

  const debouncedFetchHistoricalPage = useMemo(
    () => debounce(fetchHistoricalPage, HISTORICAL_FETCH_DEBOUNCE_MS, { leading: true, trailing: false }),
    [fetchHistoricalPage],
  )

  const restoreVisibleRangeAfterDataUpdate = useCallback(() => {
    const nextDataLength = getHistoricalPaginationDataLength(ohlcDataRef.current, oraclePriceDataRef.current)
    const previousLength = paginationDataLengthRef.current
    const update = resolveHistoricalDataUpdate({
      nextDataLength,
      pendingVisibleRange: pendingVisibleRangeRef.current,
      previousDataLength: previousLength,
    })
    paginationDataLengthRef.current = update.nextDataLength
    pendingVisibleRangeRef.current = update.pendingVisibleRange

    if (update.resetInFlight) {
      historicalFetchInFlightRef.current = false
      return
    }

    if (!chartRef.current || !update.visibleRangeToRestore) return

    // Older history is prepended, which shifts logical bar indices. Restore
    // the user's viewport after setData applies the new points; doing it
    // before setData lets the prepend move the x-axis back in time.
    chartRef.current.timeScale().setVisibleRange(update.visibleRangeToRestore)
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
