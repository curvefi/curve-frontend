import { useEffect, useRef } from 'react'

// useInterval hook came from https://overreacted.io/making-setinterval-declarative-with-react-hooks/
function usePageVisibleInterval<T>(callback: T, delay: number, isPageVisible: boolean) {
  let idRef = useRef<NodeJS.Timer | null>(null)
  const savedCallback = useRef<T | null>(null)

  useEffect(() => {
    if (typeof callback === 'function') {
      savedCallback.current = callback
    }
  }, [callback])

  useEffect(() => {
    function tick() {
      if (typeof savedCallback.current === 'function') {
        savedCallback.current()
      }
    }

    if (delay !== null) {
      let id = setInterval(tick, delay)
      idRef.current = id
      return () => clearInterval(id)
    }
  }, [delay])

  useEffect(() => {
    if (!isPageVisible && idRef.current) {
      clearInterval(idRef.current as NodeJS.Timeout)
    }
  }, [isPageVisible])
}

export default usePageVisibleInterval
