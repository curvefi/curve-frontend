import { useCallback, useEffect, useRef, useState } from 'react'
import { Duration } from '@ui-kit/themes/design/0_primitives'

/**
 * A hook that debounces a value and calls a callback when the debounce period has elapsed.
 *
 * @param initialValue - The initial value to use
 * @param debounceMs - The debounce period in milliseconds
 * @param callback - Callback function that is called after the debounce period
 * @returns A tuple containing the current value and a setter function
 *
 * @example
 * ```tsx
 * // Basic usage
 * const [search, setSearch] = useDebounce('', 300, (value) => {
 *   // This will only be called 300ms after the last setSearch call
 *   fetchSearchResults(value);
 * });
 *
 * // In a component
 * return (
 *   <input
 *     value={search}
 *     onChange={(e) => setSearch(e.target.value)}
 *   />
 * );
 * ```
 *
 * // With a controlled component
 * // The hook will update its internal value when initialValue changes
 * const [debouncedValue, setDebouncedValue] = useDebounce(externalValue, 200, handleChange);
 */
export function useDebounce<T>(initialValue: T, debounceMs: number, callback: (value: T) => void) {
  const [value, setValue] = useState<T>(initialValue)
  const timerRef = useRef<number | null>(null)

  // Update value when initialValue changes for controlled components
  useEffect(() => {
    setValue(initialValue)
  }, [initialValue])

  // Clear timer on unmount
  useEffect(
    () => () => {
      if (timerRef.current !== null) {
        clearTimeout(timerRef.current)
      }
    },
    [],
  )

  // Sets the internal value, but calls the callback after a delay unless retriggered again.
  const setDebouncedValue = useCallback(
    (newValue: T) => {
      setValue(newValue)

      // Clear any existing timer
      if (timerRef.current !== null) {
        clearTimeout(timerRef.current)
      }

      // Initiate a new timer
      timerRef.current = window.setTimeout(() => {
        callback(newValue)
        timerRef.current = null
      }, debounceMs)
    },
    [callback, debounceMs],
  )

  return [value, setDebouncedValue] as const
}

/**
 * A hook that returns a debounced version of the given value.
 * The debounced value only updates after the specified debounce period has elapsed
 * since the last change to the given value.
 * This is useful for delaying updates to a value that changes frequently,
 * such as user input, to avoid excessive computations or side effects.
 */
export function useDebouncedValue<T>(
  givenValue: T,
  { defaultValue = givenValue, debounceMs = Duration.FormDebounce }: { defaultValue?: T; debounceMs?: number } = {},
) {
  const [value, setValue] = useState<T>(defaultValue)
  useEffect(() => {
    const timer = setTimeout(() => setValue(givenValue), debounceMs)
    return () => clearTimeout(timer)
  }, [debounceMs, givenValue])
  return value
}

const SearchDebounceMs = 166 // 10 frames at 60fps

/**
 * A hook that debounces a search value and calls a callback when the debounce period has elapsed.
 */
export function useUniqueDebounce<T>(
  defaultValue: T,
  callback: (value: T) => void,
  debounceMs = SearchDebounceMs,
  equals?: (a: T, b: T) => boolean,
) {
  const lastValue = useRef(defaultValue)

  /**
   * Update lastValue when defaultValue changes to handle async initialization.
   * This prevents stale comparisons when defaultValue is loaded asynchronously.
   *
   * Example: In llamalend markets search bar, the search value is loaded from localStorage
   * asynchronously. Without this update, clearing the search after async load would compare
   * the new empty string against the initial empty string (before localStorage loaded),
   * causing the callback to not fire and missing the table filter reset.
   */
  useEffect(() => {
    lastValue.current = defaultValue
  }, [defaultValue])

  const debounceCallback = useCallback(
    (value: T) => {
      if (typeof value === 'string') {
        value = value.trim() as unknown as T
      }
      if ((equals && !equals(value, lastValue.current)) || (equals == null && value !== lastValue.current)) {
        lastValue.current = value
        callback(value)
      }
    },
    [callback, equals],
  )
  const [search, setSearch] = useDebounce(defaultValue, debounceMs, debounceCallback)
  return [search, setSearch] as const
}
