import { useEffect, useState } from 'react'
import { setTimeoutInterval } from '@ui-kit/utils/timers'

export type IncreasingLengthOptions = {
  initialLength?: number
  increaseEveryMs?: number
  maxLength?: number
}

export const DEFAULT_INCREASING_LENGTH: Required<IncreasingLengthOptions> = {
  initialLength: 3,
  increaseEveryMs: 5000,
  maxLength: 10,
}

/**
 * Returns a length value that starts at `initialLength` and increases by one every `increaseEveryMs` until it reaches
 * `maxLength`.
 */
export const useIncreasingLength = ({
  initialLength = DEFAULT_INCREASING_LENGTH.initialLength,
  increaseEveryMs = DEFAULT_INCREASING_LENGTH.increaseEveryMs,
  maxLength = DEFAULT_INCREASING_LENGTH.maxLength,
}: IncreasingLengthOptions = {}) => {
  const [length, setLength] = useState(initialLength)

  useEffect(
    () => setTimeoutInterval(() => setLength(prevLength => Math.min(maxLength, prevLength + 1)), increaseEveryMs),
    [increaseEveryMs, maxLength],
  )

  return length
}
