import type { IChartApi } from 'lightweight-charts'
import { useEffect, type RefObject } from 'react'

type Params = {
  chartRef: RefObject<IChartApi | null>
  onVisibleLogicalRangeChange: () => void
  onVisiblePriceRangeChange?: (min: number, max: number) => void
  scheduleEmitPriceRange: () => void
}

/**
 * Owns all timeScale event subscriptions used by CandleChart:
 * - logical range changes (for fetch-more and related chart state)
 * - size changes (to refresh externally synced visible y-range)
 */
export const useCandleTimeScaleSubscriptions = ({
  chartRef,
  onVisibleLogicalRangeChange,
  onVisiblePriceRangeChange,
  scheduleEmitPriceRange,
}: Params) => {
  // Keep data-loading behavior tied to timeScale logical range changes.
  useEffect(() => {
    if (!chartRef.current) return

    const timeScale = chartRef.current.timeScale()
    timeScale.subscribeVisibleLogicalRangeChange(onVisibleLogicalRangeChange)

    return () => {
      timeScale.unsubscribeVisibleLogicalRangeChange(onVisibleLogicalRangeChange)
    }
  }, [chartRef, onVisibleLogicalRangeChange])

  // Re-emit visible price range on timeScale size changes when an external
  // consumer is interested in y-range updates.
  useEffect(() => {
    if (!chartRef.current || !onVisiblePriceRangeChange) return

    const timeScale = chartRef.current.timeScale()
    timeScale.subscribeSizeChange(scheduleEmitPriceRange)
    scheduleEmitPriceRange()

    return () => {
      timeScale.unsubscribeSizeChange(scheduleEmitPriceRange)
    }
  }, [chartRef, onVisiblePriceRangeChange, scheduleEmitPriceRange])
}
