import { useCallback, useEffect, useRef, useState } from 'react'
import { Duration } from '@ui-kit/themes/design/0_primitives'

/**
 * A hook that debounces a function call and calls a callback when the debouncing period has elapsed.
 *
 * @param debounceMs - The debouncing period in milliseconds
 * @param callback - Callback function that is called after the debounce period
 * @param onChange - Optional callback function that is called immediately when the value changes
 * @returns A tuple containing the debounced function and a cancel function
 */
export function useDebounced<T extends unknown[]>(
  callback: (...value: T) => void,
  debounceMs: number,
  onChange?: (...value: T) => void,
) {
  const timerRef = useRef<number | null>(null)
  const cancel = useCallback(() => void (timerRef.current && clearTimeout(timerRef.current)), [])
  useEffect(() => cancel, [cancel])
  return [
    useCallback(
      (...newValue: T) => {
        cancel()
        onChange?.(...newValue)

        // Initiate a new timer
        timerRef.current = window.setTimeout(() => {
          callback(...newValue)
          timerRef.current = null
        }, debounceMs)
      },
      [callback, cancel, debounceMs, onChange],
    ),
    cancel,
  ] as const
}

/**
 * A hook that debounces a value and calls a callback when the debounce period has elapsed.
 *
 * @param initialValue - The initial value to use
 * @param debounceMs - The debounce period in milliseconds
 * @param callback - Callback function that is called after the debounce period
 * @returns A triple containing the current value, a setter function and a cancel function
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
 * const [debouncedValue, setDebouncedValue, cancel] = useDebounce(externalValue, 200, handleChange);
 */
export function useDebounce<T>(initialValue: T, debounceMs: number, callback: (value: T) => void) {
  const [value, setValue] = useState<T>(initialValue)
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => setValue(initialValue), [initialValue])
  return [value, ...useDebounced(callback, debounceMs, setValue)] as const
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
 * A hook that debounces a value and only calls the callback when the value has actually changed.
 * This prevents unnecessary callback executions when the debounced value hasn't changed.
 *
 * @param defaultValue - The initial value to use
 * @param callback - Function called when the debounced value changes
 * @param debounceMs - The debounce period in milliseconds (default: 166ms)
 * @param equals - Optional custom equality function to compare values
 * @returns A tuple containing the current value and a setter function
 */
export function useUniqueDebounce<T>({
  defaultValue,
  callback,
  debounceMs = SearchDebounceMs,
  equals,
}: {
  defaultValue: T
  callback: ((value: T) => void) | undefined
  debounceMs?: number
  equals?: (a: T, b: T) => boolean
}) {
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
      const isEqual = equals ? equals(value, lastValue.current) : value === lastValue.current
      if (!isEqual) {
        lastValue.current = value
        callback?.(value)
      }
    },
    [callback, equals],
  )

  return useDebounce(defaultValue, debounceMs, debounceCallback)
}
