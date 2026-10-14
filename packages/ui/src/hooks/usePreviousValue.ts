import { useState } from 'react'
import type { Nullish } from '@primitives/objects.utils'

/**
 * Returns the latest non-null/undefined value, retaining it while the current value is missing.
 */
export function usePreviousValue<T>(value: T | Nullish) {
  const [previous, setPrevious] = useState<T | Nullish>(value)
  if (value != null && !Object.is(previous, value)) {
    setPrevious(value)
  }
  return value ?? previous
}
