import { useEffect, useState } from 'react'

/**
 * Returns the previous non-null/undefined value passed to it.
 */
export function usePreviousValue<T>(value: T | null | undefined) {
  const [previous, setPrevious] = useState<T | null | undefined>(value)
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (value != null) setPrevious(value)
  }, [value])
  return previous
}
