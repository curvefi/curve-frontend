import { useCallback } from 'react'
import type { Decimal } from '@primitives/decimal.utils'
import { maybe } from '@primitives/objects.utils'
import { type QueryProp, type Range, useMappedQuery } from '@ui-kit/types/util'
import type { LiquidationRanges, LlammaLiquididationRange, LpPriceOhlcDataFormatted, OraclePriceData } from '../types'

type TimeSeriesData = LpPriceOhlcDataFormatted[] | OraclePriceData[]

type UseLiquidationRangeProps = {
  /** OHLC chart data to use for time series */
  chartData: LpPriceOhlcDataFormatted[]
  /** Fallback time series data (e.g., oracle price data) if chartData is empty */
  fallbackData?: readonly OraclePriceData[]
  /** User's current liquidation price range [low, high] */
  currentPrices: QueryProp<Range<Decimal> | null>
  /** New liquidation price range being calculated [low, high] */
  newPrices: Range<Decimal> | null | undefined
}

const EMPTY = [] as const

/**
 * Formats liquidation price ranges for display on the OHLC chart.
 *
 * Creates time-series data for liquidation bands by projecting the price
 * range across all chart data points.
 */
export const useLiquidationRange = ({
  chartData,
  fallbackData = EMPTY,
  currentPrices,
  newPrices,
}: UseLiquidationRangeProps) =>
  useMappedQuery(
    currentPrices,
    useCallback(
      (currentPrices): LiquidationRanges => {
        const timeSeriesData: TimeSeriesData = chartData.length > 0 ? chartData : [...fallbackData]

        if (timeSeriesData.length === 0) {
          return { current: null, new: null }
        }

        const formatRange = ([lowPrice, highPrice]: Range<Decimal>): LlammaLiquididationRange => ({
          price1: timeSeriesData.map(({ time }) => ({ time, value: Number(highPrice) })),
          price2: timeSeriesData.map(({ time }) => ({ time, value: Number(lowPrice) })),
        })

        return {
          current: maybe(currentPrices, formatRange) ?? null,
          new: newPrices && newPrices.length >= 2 ? formatRange(newPrices) : null,
        }
      },
      [chartData, fallbackData, newPrices],
    ),
  )
