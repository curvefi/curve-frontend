import type { IChartApi } from 'lightweight-charts'
import { throttle } from 'lodash'
import { useEffect, useRef, type RefObject } from 'react'

/**
 * Keeps external consumers (e.g. BandsChart) synced with the candle chart's
 * current visible y-range via a throttled read.
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
  const callbackRef = useRef(onVisiblePriceRangeChange)
  const lastRef = useRef({ min: 0, max: 0 })

  useEffect(() => {
    callbackRef.current = onVisiblePriceRangeChange
  }, [onVisiblePriceRangeChange])

  const emitRef = useRef<ReturnType<typeof throttle> | null>(null)

  // Build the throttled emitter once, in an effect so ref access is safe.
  useEffect(() => {
    emitRef.current = throttle(
      () => {
        const chart = chartRef.current
        if (!chart || !callbackRef.current) return

        const range = chart.priceScale('right').getVisibleRange()
        if (!range) return

        const { from: min, to: max } = range
        if (min === lastRef.current.min && max === lastRef.current.max) return

        lastRef.current = { min, max }
        callbackRef.current(min, max)
      },
      16, // ~1 frame at 60fps
      { leading: false, trailing: true },
    )
    return () => emitRef.current?.cancel()
  }, [chartRef])

  const scheduleEmitPriceRange = () => emitRef.current?.()

  // Emit when a consumer is first attached or re-attached.
  useEffect(() => {
    if (!onVisiblePriceRangeChange) return
    lastRef.current = { min: 0, max: 0 }
    scheduleEmitPriceRange()
  }, [onVisiblePriceRangeChange])

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
  }, [chartContainerRef, onVisiblePriceRangeChange])

  return { scheduleEmitPriceRange }
}
