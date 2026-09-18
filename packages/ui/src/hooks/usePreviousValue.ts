import { useEffect, useState } from 'react'
import type { Nullish } from '@primitives/objects.utils'

/**
 * Returns the previous non-null/undefined value passed to it.
 */
export function usePreviousValue<T>(value: T | Nullish) {
  const [previous, setPrevious] = useState<T | Nullish>(value)
  useEffect(() => {
    // eslint-disable-next-line @eslint-react/set-state-in-effect -- Existing violation before enabling this rule.
    if (value != null) setPrevious(value)
  }, [value])
  return previous
}
