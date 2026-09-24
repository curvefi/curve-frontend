import { isEqual, pick } from 'lodash'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { objectKeys } from '@primitives/objects.utils'
import { Duration } from '@ui/features/themes/design/0_primitives'

type DebouncedValueOptions<T> = { defaultValue?: T; debounceMs?: number }

/**
 * A hook that debounces a function call and calls a callback when the debouncing period has elapsed.
 *
 * @param debounceMs - The debouncing period in milliseconds
 * @param callback - Callback function that is called after the debounce period
 * @param onChange - Optional callback function that is called immediately when the value changes
 * @returns A debounced function
 */
export function useDebounced<T extends unknown[]>(
  callback: (...value: T) => void,
  debounceMs: number = Duration.FormDebounce,
  onChange?: (...value: T) => void,
) {
  const timerRef = useRef<number | null>(null)
  const cancel = useCallback(() => void (timerRef.current && clearTimeout(timerRef.current)), [])
  useEffect(() => cancel, [cancel])
  return useCallback(
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
  )
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
export function useDebounce<T>({
  initialValue,
  debounceMs = Duration.FormDebounce,
  callback,
}: {
  initialValue: T
  callback: (value: T) => void
  debounceMs?: number
}) {
  const [value, setValue] = useState<T>(initialValue)
  // eslint-disable-next-line @eslint-react/set-state-in-effect -- Existing violation before enabling this rule.
  useEffect(() => setValue(initialValue), [initialValue])
  return [value, useDebounced(callback, debounceMs, setValue)] as const
}

/**
 * Delays fields a person changes while keeping calculated values and application context current.
 *
 * Pass the complete params object and the form's `userDefaultValues`. Only fields named in
 * `userDefaultValues` are delayed; everything else remains current while an input is settling.
 */
export function useFormDebounce<T extends object, TDefaultKey extends keyof T>(
  values: T,
  userDefaultValues: Pick<T, TDefaultKey>,
  { debounceMs = Duration.FormDebounce }: DebouncedValueOptions<Pick<T, TDefaultKey>> = {},
) {
  const valuesToDebounce = useMemo(() => pick(values, objectKeys(userDefaultValues)), [values, userDefaultValues])
  const [debouncedValue, setDebouncedValue] = useState<Pick<T, TDefaultKey>>(valuesToDebounce)
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(valuesToDebounce), debounceMs)
    return () => clearTimeout(timer)
  }, [debounceMs, valuesToDebounce])

  const isDebouncing = !isEqual(debouncedValue, valuesToDebounce)

  const value = useMemo(() => ({ ...values, ...debouncedValue }), [values, debouncedValue])

  return [value, isDebouncing] as const
}
