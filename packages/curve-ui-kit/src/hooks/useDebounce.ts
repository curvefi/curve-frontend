import { useCallback, useEffect, useRef, useState } from 'react'

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

const SearchDebounceMs = 166 // 10 frames at 60fps

/**
 * A hook that debounces a search value and calls a callback when the debounce period has elapsed.
 */
export function useSearchDebounce<T>(defaultValue: T, callback: (value: T) => void, debounceMs = SearchDebounceMs) {
  const lastValue = useRef(defaultValue)
  const debounceCallback = useCallback(
    (value: T) => {
      if (value !== lastValue.current) {
        lastValue.current = value
        callback(value)
      }
    },
    [callback],
  )
  const [search, setSearch] = useDebounce(defaultValue, debounceMs, debounceCallback)
  return [search, setSearch] as const
}
