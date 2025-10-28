import type { IChartApi, ISeriesApi } from 'lightweight-charts'
import { CandlestickSeries } from 'lightweight-charts'
import { useEffect, useRef, RefObject } from 'react'
import type { LpPriceOhlcDataFormatted } from '../types'
import { calculateRobustPriceRange } from '../utils'

/**
 * Creates a price formatter for the candlestick series
 */
const createPriceFormatter = (totalDecimalPlacesRef: RefObject<number>) => ({
  type: 'custom' as const,
  formatter: (price: number) => {
    const [, fraction] = price.toString().split('.')

    if (!fraction) {
      return price.toFixed(4)
    }

    const nonZeroIndex = fraction.split('').findIndex((char: string) => char !== '0')

    // If the price is less than 1, then there will be 4 decimal places after the first non-zero digit.
    // If the price is greater than or equal to 1, there will be 4 decimal places after the decimal point.
    totalDecimalPlacesRef.current = price >= 1 ? 4 : nonZeroIndex + 4

    return price.toFixed(totalDecimalPlacesRef.current)
  },
  minMove: 0.0000001,
})

interface UseCandlestickSeriesOptions {
  chartRef: RefObject<IChartApi | null>
  ohlcData: LpPriceOhlcDataFormatted[]
  upColor: string
  downColor: string
}

/**
 * Hook to manage candlestick series
 * Handles series creation, data updates, and custom auto-scaling
 */
export const useCandlestickSeries = ({ chartRef, ohlcData, upColor, downColor }: UseCandlestickSeriesOptions) => {
  const candlestickSeriesRef = useRef<ISeriesApi<'Candlestick'> | null>(null)
  const totalDecimalPlacesRef = useRef(4)
  const ohlcDataRef = useRef(ohlcData)

  // Keep ohlcDataRef in sync with latest ohlcData
  useEffect(() => {
    ohlcDataRef.current = ohlcData
  }, [ohlcData])

  // Create candlestick series
  useEffect(() => {
    if (!chartRef.current || candlestickSeriesRef.current) return

    candlestickSeriesRef.current = chartRef.current.addSeries(CandlestickSeries, {
      priceLineStyle: 2,
      upColor,
      downColor,
      borderVisible: false,
      wickUpColor: upColor,
      wickDownColor: downColor,
      priceFormat: createPriceFormatter(totalDecimalPlacesRef),
      autoscaleInfoProvider: (original: () => { priceRange: { minValue: number; maxValue: number } | null } | null) => {
        const originalRange = original()

        if (!originalRange || !chartRef.current || !candlestickSeriesRef.current) {
          return originalRange
        }

        // Get visible logical range to determine which bars are visible
        const visibleLogicalRange = chartRef.current.timeScale().getVisibleLogicalRange()

        if (!visibleLogicalRange) {
          return originalRange
        }

        // Get the bars that are currently visible
        const barsInfo = candlestickSeriesRef.current.barsInLogicalRange(visibleLogicalRange)

        // Use ref to access latest ohlcData without causing series recreation
        const currentOhlcData = ohlcDataRef.current

        if (!barsInfo || !currentOhlcData || currentOhlcData.length === 0) {
          return originalRange
        }

        // Calculate the slice indices for visible bars
        const startIndex = Math.max(0, Math.floor(barsInfo.barsBefore))
        const endIndex = Math.min(currentOhlcData.length, currentOhlcData.length - Math.floor(barsInfo.barsAfter))

        // Get visible bars
        const visibleBars = currentOhlcData.slice(startIndex, endIndex)

        if (visibleBars.length === 0) {
          return originalRange
        }

        // Collect all price points (high and low) from visible bars
        const allPrices = visibleBars.flatMap((item) => [item.high, item.low])

        // Get the latest 5 candles to always include in range (current price action)
        const recentCandleCount = Math.min(5, visibleBars.length)
        const recentCandles = visibleBars.slice(-recentCandleCount)
        const recentPrices = recentCandles.flatMap((item) => [item.high, item.low])

        // Calculate robust price range excluding outliers but always including recent prices
        const robustRange = calculateRobustPriceRange(allPrices, recentPrices)

        // If we can't calculate a robust range, fall back to original auto-scaling
        if (!robustRange) {
          return originalRange
        }

        return {
          priceRange: robustRange,
        }
      },
    })

    return () => {
      candlestickSeriesRef.current = null
    }
  }, [chartRef, upColor, downColor])

  // Update OHLC data when it changes
  useEffect(() => {
    if (!candlestickSeriesRef.current || !ohlcData) return

    candlestickSeriesRef.current.setData(ohlcData)
  }, [ohlcData])

  return candlestickSeriesRef
}
