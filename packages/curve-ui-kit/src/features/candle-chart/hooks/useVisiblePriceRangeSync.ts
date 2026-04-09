import type { IChartApi } from 'lightweight-charts'
import { throttle } from 'lodash'
import { useCallback, useEffect, useRef, type RefObject } from 'react'

// Ignore microscopic floating-point drift from autoscale math so we don't
// emit range updates that are visually identical but still trigger re-renders.
const PRICE_RANGE_ABSOLUTE_EPSILON = 1e-8
const PRICE_RANGE_RELATIVE_EPSILON = 1e-6
const THROTTLE_MS = 16
const STEADY_STATE_BURST_FRAMES = 3
const SETTLE_BURST_FRAMES = 2

const hasSignificantRangeChange = (previous: { min: number; max: number }, next: { min: number; max: number }) => {
  // Scale tolerance with value magnitude so behavior is stable across small/large prices.
  const scale = Math.max(Math.abs(previous.min), Math.abs(previous.max), Math.abs(next.min), Math.abs(next.max), 1)
  const tolerance = Math.max(PRICE_RANGE_ABSOLUTE_EPSILON, scale * PRICE_RANGE_RELATIVE_EPSILON)
  return Math.abs(previous.min - next.min) > tolerance || Math.abs(previous.max - next.max) > tolerance
}

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
  // Keep the latest callback without rebuilding throttled/event handlers.
  const callbackRef = useRef(onVisiblePriceRangeChange)
  // Last emitted range used for jitter filtering.
  const lastRef = useRef({ min: 0, max: 0 })

  useEffect(() => {
    callbackRef.current = onVisiblePriceRangeChange
  }, [onVisiblePriceRangeChange])

  const emitRef = useRef<ReturnType<typeof throttle> | null>(null)
  const emitRafRef = useRef<number | null>(null)
  // Number of remaining frames to sample after a trigger. Multiple triggers
  // extend this burst so we can capture post-autoscale settling.
  const emitBurstFramesRef = useRef(0)

  // Single source of truth for reading and emitting the visible range.
  const emitVisibleRange = useCallback(() => {
    const chart = chartRef.current
    if (!chart || !callbackRef.current) return

    const range = chart.priceScale('right').getVisibleRange()
    if (!range) return

    const { from: min, to: max } = range
    if (!hasSignificantRangeChange(lastRef.current, { min, max })) return

    lastRef.current = { min, max }
    callbackRef.current(min, max)
  }, [chartRef])

  const runEmitFrame = useCallback(() => {
    const tick = () => {
      emitRafRef.current = null
      emitVisibleRange()
      emitBurstFramesRef.current = Math.max(0, emitBurstFramesRef.current - 1)

      if (emitBurstFramesRef.current > 0) {
        emitRafRef.current = requestAnimationFrame(tick)
      }
    }

    tick()
  }, [emitVisibleRange])

  const scheduleEmitPriceRangeFrames = useCallback(
    (frames: number) => {
      if (!callbackRef.current) return
      // Never shrink an in-flight burst; only extend it.
      emitBurstFramesRef.current = Math.max(emitBurstFramesRef.current, frames)

      if (emitRafRef.current === null) {
        emitRafRef.current = requestAnimationFrame(runEmitFrame)
      }
    },
    [runEmitFrame],
  )

  // Build the throttled emitter once, in an effect so ref access is safe.
  useEffect(() => {
    emitRef.current = throttle(() => scheduleEmitPriceRangeFrames(STEADY_STATE_BURST_FRAMES), THROTTLE_MS, {
      leading: true,
      trailing: true,
    })
    return () => {
      emitRef.current?.cancel()
      if (emitRafRef.current !== null) {
        cancelAnimationFrame(emitRafRef.current)
        emitRafRef.current = null
      }
      emitBurstFramesRef.current = 0
    }
  }, [scheduleEmitPriceRangeFrames])

  const scheduleEmitPriceRange = useCallback(() => {
    emitRef.current?.()
  }, [])

  const flushEmitPriceRange = useCallback(() => {
    emitRef.current?.flush()
  }, [])

  // Emit when a consumer is first attached or re-attached.
  useEffect(() => {
    if (!onVisiblePriceRangeChange) return
    lastRef.current = { min: 0, max: 0 }
    scheduleEmitPriceRangeFrames(SETTLE_BURST_FRAMES)
  }, [onVisiblePriceRangeChange, scheduleEmitPriceRangeFrames])

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
      flushEmitPriceRange()
      // After the final interaction event, sample a short burst to capture any
      // one-frame-late autoscale adjustment.
      scheduleEmitPriceRangeFrames(SETTLE_BURST_FRAMES)
    }
    const handleTouchEnd = () => {
      scheduleEmitPriceRange()
      flushEmitPriceRange()
      scheduleEmitPriceRangeFrames(SETTLE_BURST_FRAMES)
    }

    container.addEventListener('pointermove', handlePointerMove)
    container.addEventListener('wheel', scheduleEmitPriceRange, { passive: true })
    container.addEventListener('touchend', handleTouchEnd, { passive: true })
    window.addEventListener('pointerup', handleWindowPointerUp)
    window.addEventListener('pointercancel', handleWindowPointerUp)

    return () => {
      container.removeEventListener('pointermove', handlePointerMove)
      container.removeEventListener('wheel', scheduleEmitPriceRange)
      container.removeEventListener('touchend', handleTouchEnd)
      window.removeEventListener('pointerup', handleWindowPointerUp)
      window.removeEventListener('pointercancel', handleWindowPointerUp)
    }
  }, [
    chartContainerRef,
    flushEmitPriceRange,
    onVisiblePriceRangeChange,
    scheduleEmitPriceRange,
    scheduleEmitPriceRangeFrames,
  ])

  return { scheduleEmitPriceRange }
}
