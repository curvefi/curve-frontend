import type { ChangeEvent } from 'react'
import { useCallback, useEffect, useState } from 'react'

function useDebounceValue(initialVal: string, delay: number, callback: (value: string) => void) {
  const [val, setVal] = useState(initialVal)
  const [timer, setTimer] = useState<number | null>(null)

  useEffect(() => {
    if (initialVal !== val) {
      setVal(initialVal)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialVal])

  const handleInputChange = useCallback(
    (evt: ChangeEvent<HTMLInputElement>) => {
      const { value } = evt.target
      setVal(value)

      if (timer) {
        clearTimeout(timer)
      }

      const timerId = window.setTimeout(() => callback(value), delay)
      setTimer(timerId)

      return () => {
        if (timer) {
          clearTimeout(timer)
        }
      }
    },
    [callback, delay, timer],
  )

  return [val, handleInputChange] as const
}

export default useDebounceValue
