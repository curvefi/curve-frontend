import { useEffect, useState } from 'react'

/**
 * Returns the previous non-null/undefined value passed to it.
 */
export function usePreviousValue<T>(value: T | null | undefined) {
  const [previous, setPrevious] = useState<T | null | undefined>(value)
  useEffect(() => {
    // eslint-disable-next-line @eslint-react/set-state-in-effect -- Existing violation before enabling this rule.
    if (value != null) setPrevious(value)
  }, [value])
  return previous
}
