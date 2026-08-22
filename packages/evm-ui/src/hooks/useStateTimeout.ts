import { useCallback, useRef, useState } from 'react'
import { Duration } from '@ui-kit/themes/design/0_primitives'

/**
 * Timeout hook that returns a boolean indicating if the data has taken too long to load.
 * @returns [isTimedOut, setIsReady]
 * - isTimedOut is true if the data has been loaded for longer than Duration.LoadingTimeout
 * - setIsReady is a function that takes a boolean indicating if the data is ready.
 *   If the data is ready, the timeout is cleared and isTimedOut is set to false.
 *   If the data is not ready and there is no timeout yet, a timer is started.
 */
export function useStateTimeout() {
  const [isTimedOut, setIsTimedOut] = useState(false)
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>(null)
  const setIsReady = useCallback((isReady: boolean) => {
    if (isReady && timeoutRef.current) {
      clearTimeout(timeoutRef.current)
      timeoutRef.current = null
      setIsTimedOut(false)
    }
    if (!isReady && !timeoutRef.current) {
      timeoutRef.current = setTimeout(() => {
        timeoutRef.current = null
        setIsTimedOut(true)
      }, Duration.LoadingTimeout) // if the query takes more than 5 seconds, show the data we have (even if user data is not ready, as it's less important)
    }
    return isReady
  }, [])
  return [isTimedOut, setIsReady] as const
}
