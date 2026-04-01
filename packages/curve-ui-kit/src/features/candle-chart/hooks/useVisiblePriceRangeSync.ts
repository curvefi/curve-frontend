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
  const emitPriceRangeBurstFramesRef = useRef(0)
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
  const scheduleEmitPriceRangeFrames = useCallback(
    (frames: number) => {
      if (!onVisiblePriceRangeChangeRef.current) return

      emitPriceRangeBurstFramesRef.current = Math.max(emitPriceRangeBurstFramesRef.current, frames)
      if (emitPriceRangeRafRef.current !== null) return

      const run = () => {
        emitPriceRangeRafRef.current = null
        emitPriceRangeNow()
        emitPriceRangeBurstFramesRef.current = Math.max(0, emitPriceRangeBurstFramesRef.current - 1)

        if (emitPriceRangeBurstFramesRef.current > 0) {
          emitPriceRangeRafRef.current = requestAnimationFrame(run)
        }
      }

      emitPriceRangeRafRef.current = requestAnimationFrame(run)
    },
    [emitPriceRangeNow],
  )

  const scheduleEmitPriceRange = useCallback(() => {
    scheduleEmitPriceRangeFrames(3)
  }, [scheduleEmitPriceRangeFrames])

  const scheduleEmitPriceRangeGesture = useCallback(() => {
    scheduleEmitPriceRangeFrames(5)
  }, [scheduleEmitPriceRangeFrames])

  // Emit immediately when a consumer is attached or re-attached.
  useEffect(() => {
    if (!onVisiblePriceRangeChange) return
    lastEmittedPriceRangeRef.current = null
    scheduleEmitPriceRange()
  }, [onVisiblePriceRangeChange, scheduleEmitPriceRange])

  useEffect(
    () => () => {
      if (emitPriceRangeRafRef.current !== null) {
        cancelAnimationFrame(emitPriceRangeRafRef.current)
        emitPriceRangeRafRef.current = null
      }
      emitPriceRangeBurstFramesRef.current = 0
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
        scheduleEmitPriceRangeGesture()
      }
    }
    const handleWindowPointerUp = () => {
      scheduleEmitPriceRangeGesture()
    }

    container.addEventListener('pointermove', handlePointerMove)
    container.addEventListener('pointerup', scheduleEmitPriceRangeGesture)
    container.addEventListener('wheel', scheduleEmitPriceRangeGesture, { passive: true })
    container.addEventListener('touchend', scheduleEmitPriceRangeGesture, { passive: true })
    window.addEventListener('pointerup', handleWindowPointerUp)
    window.addEventListener('pointercancel', handleWindowPointerUp)
    window.addEventListener('mouseup', handleWindowPointerUp)

    return () => {
      container.removeEventListener('pointermove', handlePointerMove)
      container.removeEventListener('pointerup', scheduleEmitPriceRangeGesture)
      container.removeEventListener('wheel', scheduleEmitPriceRangeGesture)
      container.removeEventListener('touchend', scheduleEmitPriceRangeGesture)
      window.removeEventListener('pointerup', handleWindowPointerUp)
      window.removeEventListener('pointercancel', handleWindowPointerUp)
      window.removeEventListener('mouseup', handleWindowPointerUp)
    }
  }, [chartContainerRef, onVisiblePriceRangeChange, scheduleEmitPriceRangeGesture])

  return { scheduleEmitPriceRange }
}
