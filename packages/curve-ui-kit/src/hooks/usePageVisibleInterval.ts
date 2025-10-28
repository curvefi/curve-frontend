import { useEffect, useEffectEvent } from 'react'

type CallbackFunction = () => unknown

/**
 * A hook that runs a callback function at specified intervals, but only when the page is visible.
 * Uses setTimeout instead of setInterval to handle promises and non-promises returned by the callback.
 *
 * @param callback - Function to be called at each interval
 * @param delay - Interval duration in milliseconds
 * @param enabled - Boolean indicating if the query should be active (e.g., if the page is visible)
 *
 * @example
 * // With constants for interval timing
 * usePageVisibleInterval(
 *   () => {
 *     if (curve) {
 *       fetchPoolsData(curve);
 *       fetchGasInfo(curve);
 *     }
 *   },
 *   REFRESH_INTERVAL['5m'],
 *   isPageVisible
 * );
 */
export default function usePageVisibleInterval(callback: CallbackFunction, delay: number, enabled: boolean) {
  const callbackEvent = useEffectEvent(callback)
  useEffect(() => {
    let id: ReturnType<typeof setTimeout>
    const schedule = () => {
      if (enabled && delay !== null) id = setTimeout(() => Promise.resolve(callbackEvent()).then(schedule), delay)
    }
    schedule()
    return () => clearTimeout(id)
  }, [delay, enabled])
}
