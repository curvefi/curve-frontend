import { identity, isEqual, pick } from 'lodash'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { objectKeys } from '@primitives/objects.utils'
import { Duration } from '@ui/features/themes/design/0_primitives'

type DebouncedValueOptions<T> = {
  defaultValue?: T
  debounceMs?: number
}

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
  debounceMs: number = Duration.FormDebounce,
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
  { defaultValue = givenValue, debounceMs = Duration.FormDebounce }: DebouncedValueOptions<T> = {},
) {
  const [value, setValue] = useState<T>(defaultValue)
  useEffect(() => {
    const timer = setTimeout(() => setValue(givenValue), debounceMs)
    return () => clearTimeout(timer)
  }, [debounceMs, givenValue])
  return value
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
  options?: DebouncedValueOptions<Pick<T, TDefaultKey>>,
) {
  const valuesToDebounce = useMemo(() => pick(values, objectKeys(userDefaultValues)), [values, userDefaultValues])
  const debouncedValue = useDebouncedValue(valuesToDebounce, options)
  const isDebouncing = !isEqual(debouncedValue, valuesToDebounce)

  const value = useMemo(() => ({ ...values, ...debouncedValue }), [values, debouncedValue])

  return [value, isDebouncing] as const
}

/**
 * A hook that debounces a value and only calls the callback when the value has actually changed.
 * This prevents unnecessary callback executions when the debounced value hasn't changed.
 *
 * @param defaultValue - The initial value to use
 * @param callback - Function called when the debounced value changes
 * @param debounceMs - The debounce period in milliseconds (default: 166ms)
 * @param equals - Optional custom equality function to compare values
 * @param sanitize - Optional custom cleaning function to transform values before comparison (default: identity)
 * @returns A tuple containing the current value and a setter function
 */
export function useUniqueDebounce<T>({
  defaultValue,
  callback: onChange,
  debounceMs = Duration.FormDebounce,
  equals = isEqual,
  sanitize = identity,
}: {
  defaultValue: T
  callback: ((value: T) => void) | undefined
  debounceMs?: number
  equals?: (a: T, b: T) => boolean
  sanitize?: (value: T) => T
}) {
  const [value, setValue] = useState<T>(defaultValue)
  const lastCallbackValueRef = useRef(defaultValue)

  useEffect(() => {
    // if the default value changes externally and is different from the last value that triggered the callback,
    // update the initial value to reflect the change. This will override the input contents and the debounced value.
    if (!equals(lastCallbackValueRef.current, defaultValue)) {
      lastCallbackValueRef.current = defaultValue
      setValue(defaultValue)
    }
  }, [defaultValue, equals])

  const callback = useCallback(
    (givenValue: T) => {
      const value = sanitize(givenValue)
      if (!equals(value, lastCallbackValueRef.current)) {
        lastCallbackValueRef.current = value
        onChange?.(value)
      }
    },
    [onChange, sanitize, equals],
  )

  return [value, ...useDebounced(callback, debounceMs, setValue)] as const
}
