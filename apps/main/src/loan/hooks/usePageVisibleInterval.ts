import { useEffect, useRef } from 'react'

// useInterval hook came from https://overreacted.io/making-setinterval-declarative-with-react-hooks/
function usePageVisibleInterval<T>(callback: T, delay: number, isPageVisible: boolean) {
  const idRef = useRef<NodeJS.Timer | null>(null)
  const savedCallback = useRef<T | null>(null)

  useEffect(() => {
    if (typeof callback === 'function') {
      savedCallback.current = callback
    }
  }, [callback])

  useEffect(() => {
    function band() {
      if (typeof savedCallback.current === 'function') {
        savedCallback.current()
      }
    }

    if (delay !== null) {
      const id = setInterval(band, delay)
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
