import { Dispatch, SetStateAction, useCallback, useEffect, useState } from 'react'

export type GetAndSet<T> = [T, Dispatch<SetStateAction<T>>]

const storageEvent = new EventTarget()

/**
 * Hook for storage similar to useState, but allowing custom get/set functions.
 */
export function useStoredState<T>({
  key,
  initialValue,
  get,
  set,
}: {
  key: string
  initialValue: T
  get: (key: string, initialValue: T) => T
  set: (key: string, value: T) => unknown
}): GetAndSet<T> {
  // we only return the actual storage value after render to avoid hydration issues
  const [stateValue, setStateValue] = useState<T>(initialValue)
  const setValue = useCallback(
    (setter: SetStateAction<T>) => {
      const value: T = typeof setter === 'function' ? (setter as (prev: T) => T)(get(key, initialValue)) : setter
      set(key, value)
      setStateValue(value)
      storageEvent.dispatchEvent(new Event(key))
    },
    [get, initialValue, key, set],
  )
  useEffect(() => {
    // Update state when other components update the local storage
    const listener = () => setStateValue(get(key, initialValue))
    listener()
    storageEvent.addEventListener(key, listener)
    return () => storageEvent.removeEventListener(key, listener)
  }, [get, initialValue, key])

  return [stateValue, setValue]
}
