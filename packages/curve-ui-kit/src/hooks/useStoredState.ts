import { Dispatch, SetStateAction, useCallback, useEffect, useState } from 'react'

export type GetAndSet<T, D = T> = [T | D, Dispatch<SetStateAction<T | D>>]

const storageEvent = new EventTarget()

/**
 * Hook for storage similar to useState, but allowing custom get/set functions.
 */
export function useStoredState<Type, Default = Type>({
  key,
  initialValue,
  get,
  set,
}: {
  key: string
  initialValue: Default
  get: (key: string, initialValue?: Default) => Type | Default
  set: (key: string, value: Type | Default) => unknown
}): GetAndSet<Type, Default> {
  type T = Type | Default
  // we only return the actual storage value after render to avoid hydration issues
  const [stateValue, setStateValue] = useState<T | Default>(initialValue)
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
