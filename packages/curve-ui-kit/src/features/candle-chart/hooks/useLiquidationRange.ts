import { useMemo } from 'react'
import type { LiquidationRanges, LlammaLiquididationRange, LpPriceOhlcDataFormatted, OraclePriceData } from '../types'

type TimeSeriesData = LpPriceOhlcDataFormatted[] | OraclePriceData[]

type UseLiquidationRangeProps = {
  /** OHLC chart data to use for time series */
  chartData: LpPriceOhlcDataFormatted[]
  /** Fallback time series data (e.g., oracle price data) if chartData is empty */
  fallbackData?: OraclePriceData[]
  /** User's current liquidation price range [low, high] */
  currentPrices: string[] | null
  /** New liquidation price range being calculated [low, high] */
  newPrices: string[] | null
}

/**
 * Formats liquidation price ranges for display on the OHLC chart.
 *
 * Creates time-series data for liquidation bands by projecting the price
 * range across all chart data points.
 */
export const useLiquidationRange = ({
  chartData,
  fallbackData = [],
  currentPrices,
  newPrices,
}: UseLiquidationRangeProps): LiquidationRanges =>
  useMemo(() => {
    const liqRanges: LiquidationRanges = {
      current: null,
      new: null,
    }

    const timeSeriesData: TimeSeriesData = chartData.length > 0 ? chartData : fallbackData

    if (timeSeriesData.length === 0) {
      return liqRanges
    }

    const formatRange = (prices: string[]): LlammaLiquididationRange => {
      const [lowPrice, highPrice] = prices
      const range: LlammaLiquididationRange = {
        price1: [],
        price2: [],
      }

      for (const data of timeSeriesData) {
        range.price1.push({
          time: data.time,
          value: +highPrice,
        })
        range.price2.push({
          time: data.time,
          value: +lowPrice,
        })
      }

      return range
    }

    if (currentPrices && currentPrices.length >= 2) {
      liqRanges.current = formatRange(currentPrices)
    }

    if (newPrices && newPrices.length >= 2) {
      liqRanges.new = formatRange(newPrices)
    }

    return liqRanges
  }, [chartData, fallbackData, currentPrices, newPrices])
