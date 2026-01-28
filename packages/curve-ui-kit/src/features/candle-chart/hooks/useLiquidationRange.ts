import { useMemo } from 'react'
import type { LiquidationRanges, LlammaLiquididationRange, LpPriceOhlcDataFormatted, OraclePriceData } from '../types'

type TimeSeriesData = LpPriceOhlcDataFormatted[] | OraclePriceData[]

type UseLiquidationRangeProps = {
  /** OHLC chart data to use for time series */
  chartData: LpPriceOhlcDataFormatted[]
  /** Fallback time series data (e.g., oracle price data) if chartData is empty */
  fallbackData?: OraclePriceData[]
  /** User's current liquidation price range [low, high] */
  currentPrices: string[] | null | undefined
  /** New liquidation price range being calculated [low, high] */
  newPrices: string[] | null | undefined
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
    const timeSeriesData: TimeSeriesData = chartData.length > 0 ? chartData : fallbackData

    if (timeSeriesData.length === 0) {
      return { current: null, new: null }
    }

    const formatRange = (prices: string[]): LlammaLiquididationRange => {
      const [lowPrice, highPrice] = prices
      return {
        price1: timeSeriesData.map((data) => ({ time: data.time, value: Number(highPrice) })),
        price2: timeSeriesData.map((data) => ({ time: data.time, value: Number(lowPrice) })),
      }
    }

    return {
      current: currentPrices && currentPrices.length >= 2 ? formatRange(currentPrices) : null,
      new: newPrices && newPrices.length >= 2 ? formatRange(newPrices) : null,
    }
  }, [chartData, fallbackData, currentPrices, newPrices])
