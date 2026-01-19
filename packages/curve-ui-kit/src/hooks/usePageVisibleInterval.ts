import { useEffect, useEffectEvent } from 'react'
import { useLayoutStore } from '@ui-kit/features/layout'
import { setTimeoutInterval } from '@ui-kit/utils/timers'

type CallbackFunction = () => unknown

/**
 * A hook that runs a callback function at specified intervals, but only when the page is visible.
 * Uses setTimeout instead of setInterval to handle promises and non-promises returned by the callback.
 *
 * @param callback - Function to be called at each interval
 * @param delay - Interval duration in milliseconds
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
 *   REFRESH_INTERVAL['5m']
 * );
 */
export function usePageVisibleInterval(callback: CallbackFunction, delay: number) {
  const isPageVisible = useLayoutStore((state) => state.isPageVisible)
  const callbackEvent = useEffectEvent(callback)
  useEffect(() => (isPageVisible ? setTimeoutInterval(callbackEvent, delay) : undefined), [delay, isPageVisible])
}
