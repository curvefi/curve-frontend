import { identity } from 'lodash'
import { useCallback, useEffect, useRef, useState } from 'react'

export function useUnique<T>({
  defaultValue,
  callback: onChange,
  equals,
  sanitize = identity,
}: {
  defaultValue: T
  callback: ((value: T) => void) | undefined
  equals: (a: T, b: T) => boolean
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
        setValue(value)
      }
    },
    [onChange, sanitize, equals],
  )

  return [value, callback] as const
}
