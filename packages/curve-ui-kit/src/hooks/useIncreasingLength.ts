import { useEffect, useState } from 'react'
import { setTimeoutInterval } from '@ui-kit/utils/timers'

export interface IncreasingLengthOptions {
  initialLength?: number
  increaseEveryMs?: number
  maxLength?: number
}

/**
 * Returns a length value that starts at `initialLength` and increases by one every `increaseEveryMs` until it reaches
 * `maxLength`.
 */
export const useIncreasingLength = ({
  initialLength = 3,
  increaseEveryMs = 5000,
  maxLength = 10,
}: IncreasingLengthOptions = {}) => {
  const [length, setLength] = useState(initialLength)

  useEffect(
    () => setTimeoutInterval(() => setLength(prevLength => Math.min(maxLength, prevLength + 1)), increaseEveryMs),
    [increaseEveryMs, maxLength],
  )

  return length
}
