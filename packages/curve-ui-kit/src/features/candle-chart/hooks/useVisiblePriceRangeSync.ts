import type { IChartApi } from 'lightweight-charts'
import { useCallback, useEffect, useRef, type RefObject } from 'react'

/**
 * Keeps external consumers (e.g. BandsChart) synced with the candle chart's
 * current visible y-range.
 */
export const useVisiblePriceRangeSync = ({
  chartRef,
  chartContainerRef,
  onVisiblePriceRangeChange,
}: {
  chartRef: RefObject<IChartApi | null>
  chartContainerRef: RefObject<HTMLDivElement | null>
  onVisiblePriceRangeChange?: (min: number, max: number) => void
}) => {
  const onVisiblePriceRangeChangeRef = useRef(onVisiblePriceRangeChange)
  const emitPriceRangeRafRef = useRef<number | null>(null)
  const lastEmittedPriceRangeRef = useRef<{ min: number; max: number } | null>(null)

  useEffect(() => {
    onVisiblePriceRangeChangeRef.current = onVisiblePriceRangeChange
  }, [onVisiblePriceRangeChange])

  // Read from the chart and emit only when min/max actually changed.
  const emitPriceRangeNow = useCallback(() => {
    if (!chartRef.current || !onVisiblePriceRangeChangeRef.current) return

    const priceRange = chartRef.current.priceScale('right').getVisibleRange()
    if (!priceRange) return

    const min = priceRange.from
    const max = priceRange.to
    const previous = lastEmittedPriceRangeRef.current

    if (previous && previous.min === min && previous.max === max) {
      return
    }

    lastEmittedPriceRangeRef.current = { min, max }
    onVisiblePriceRangeChangeRef.current(min, max)
  }, [chartRef])

  // Batch rapid triggers into requestAnimationFrame and sample multiple frames so post-gesture
  // autoscale settling is captured reliably.
  const scheduleEmitPriceRange = useCallback(() => {
    if (!onVisiblePriceRangeChangeRef.current) return
    if (emitPriceRangeRafRef.current !== null) return // already sampling, skip

    const run = (remaining: number) => {
      emitPriceRangeRafRef.current = null
      emitPriceRangeNow()
      if (remaining > 1) {
        emitPriceRangeRafRef.current = requestAnimationFrame(() => run(remaining - 1))
      }
    }
    emitPriceRangeRafRef.current = requestAnimationFrame(() => run(5))
  }, [emitPriceRangeNow])

  // Emit immediately when a consumer is attached or re-attached.
  useEffect(() => {
    if (!onVisiblePriceRangeChange) return
    lastEmittedPriceRangeRef.current = null
    scheduleEmitPriceRange()
  }, [onVisiblePriceRangeChange, scheduleEmitPriceRange])

  // Cancel any in-flight animation frame burst on unmount.
  useEffect(
    () => () => {
      if (emitPriceRangeRafRef.current !== null) {
        cancelAnimationFrame(emitPriceRangeRafRef.current)
        emitPriceRangeRafRef.current = null
      }
    },
    [],
  )

  // lightweight-charts exposes priceScale().getVisibleRange(), but no
  // subscribeVisiblePriceRangeChange API. Gesture listeners are the fallback
  // trigger so we can re-read the settled y-range after user interactions.
  useEffect(() => {
    const container = chartContainerRef.current
    if (!container || !onVisiblePriceRangeChange) return

    const handlePointerMove = (event: PointerEvent) => {
      if (event.buttons > 0) {
        scheduleEmitPriceRange()
      }
    }
    // Listen on window so we catch pointer-up even if the cursor leaves the container.
    const handleWindowPointerUp = () => {
      scheduleEmitPriceRange()
    }

    container.addEventListener('pointermove', handlePointerMove)
    container.addEventListener('wheel', scheduleEmitPriceRange, { passive: true })
    container.addEventListener('touchend', scheduleEmitPriceRange, { passive: true })
    window.addEventListener('pointerup', handleWindowPointerUp)
    window.addEventListener('pointercancel', handleWindowPointerUp)

    return () => {
      container.removeEventListener('pointermove', handlePointerMove)
      container.removeEventListener('wheel', scheduleEmitPriceRange)
      container.removeEventListener('touchend', scheduleEmitPriceRange)
      window.removeEventListener('pointerup', handleWindowPointerUp)
      window.removeEventListener('pointercancel', handleWindowPointerUp)
    }
  }, [chartContainerRef, onVisiblePriceRangeChange, scheduleEmitPriceRange])

  return { scheduleEmitPriceRange }
}
