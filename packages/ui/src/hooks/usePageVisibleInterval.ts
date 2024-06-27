import * as React from 'react'

// useInterval hook came from https://overreacted.io/making-setinterval-declarative-with-react-hooks/
function usePageVisibleInterval<T>(callback: T, delay: number, isPageVisible: boolean) {
  let idRef = React.useRef<NodeJS.Timer | null>(null)
  const savedCallback = React.useRef<T | null>(null)

  React.useEffect(() => {
    if (typeof callback === 'function') {
      savedCallback.current = callback
    }
  }, [callback])

  React.useEffect(() => {
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

  React.useEffect(() => {
    if (!isPageVisible && idRef.current) {
      clearInterval(idRef.current as NodeJS.Timeout)
    }
  }, [isPageVisible])
}

export default usePageVisibleInterval
