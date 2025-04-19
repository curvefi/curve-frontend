import { useEffect, useRef } from 'react'

type CallbackFunction = () => unknown

/**
 * A hook that runs a callback function at specified intervals, but only when the page is visible.
 * Based on the useInterval hook from https://overreacted.io/making-setinterval-declarative-with-react-hooks/
 *
 * @param callback - Function to be called at each interval
 * @param delay - Interval duration in milliseconds
 * @param isPageVisible - Boolean indicating if the page is currently visible
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
export default function usePageVisibleInterval(callback: CallbackFunction, delay: number, isPageVisible: boolean) {
  const idRef = useRef<NodeJS.Timer | null>(null)
  const savedCallback = useRef<CallbackFunction>(callback)

  // Remember the latest callback
  useEffect(() => {
    savedCallback.current = callback
  }, [callback])

  // Set up the interval
  useEffect(() => {
    function executeCallback() {
      savedCallback.current()
    }

    // Only set up interval if page is visible
    if (delay !== null && isPageVisible) {
      const id = setInterval(executeCallback, delay)
      idRef.current = id
      return () => clearInterval(id)
    }
  }, [delay, isPageVisible])
}
