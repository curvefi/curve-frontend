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
function useDebounce<T>(initialValue: T, debounceMs: number, callback: (value: T) => void) {
  const [value, setValue] = useState<T>(initialValue)
  const timerRef = useRef<number | null>(null)

  const clearTimer = useCallback(() => {
    if (timerRef.current !== null) {
      clearTimeout(timerRef.current)
      timerRef.current = null
    }
  }, [])

  // Update value when initialValue changes for controlled components
  useEffect(() => {
    setValue(initialValue)
  }, [initialValue])

  useEffect(() => {
    clearTimer()

    // Set new timer and call callback when expired
    timerRef.current = window.setTimeout(() => {
      callback(value)
      timerRef.current = null
    }, debounceMs)

    return clearTimer
  }, [value, debounceMs, callback, clearTimer])

  return [value, setValue] as const
}

export default useDebounce
