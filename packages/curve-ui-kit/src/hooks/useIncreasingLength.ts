import { useEffect, useState } from 'react'
import { setTimeoutInterval } from '@ui-kit/utils/timers'

type IncreasingLengthOptions = {
  initialLength?: number
  increaseEveryMs?: number
  maxLength?: number
}

const DEFAULT: Required<IncreasingLengthOptions> = {
  initialLength: 3,
  increaseEveryMs: 5000,
  maxLength: 10,
}

const INCREASING_LENGTH_CATEGORIES = {
  default: DEFAULT,
  disabled: { ...DEFAULT, maxLength: DEFAULT.initialLength },
  chips: { ...DEFAULT, maxLength: 5 },
  limited: { ...DEFAULT, initialLength: 1, maxLength: 3 },
} as const satisfies Record<string, IncreasingLengthOptions>

export type IncreasingLengthCategory = keyof typeof INCREASING_LENGTH_CATEGORIES

/** Returns a length value that starts at `initialLength` and increases by one every `increaseEveryMs` until it reaches `maxLength` */
export const useIncreasingLength = (category: IncreasingLengthCategory = 'default') => {
  const { initialLength, increaseEveryMs, maxLength } = INCREASING_LENGTH_CATEGORIES[category]
  const [length, setLength] = useState(initialLength)

  useEffect(
    () => setTimeoutInterval(() => setLength(prevLength => Math.min(maxLength, prevLength + 1)), increaseEveryMs),
    [increaseEveryMs, maxLength],
  )

  return length
}
