import { Dispatch, SetStateAction, useCallback, useState } from 'react'

export type GetAndSet<T, D = T> = [T | D, Dispatch<SetStateAction<T>>]

export function getFromLocalStorage<T>(storageKey: string): T | null {
  const item = window.localStorage.getItem(storageKey)
  return item && JSON.parse(item)
}

export function setLocalStorage<T>(storageKey: string, value: T | null) {
  if (value == null) {
    return window.localStorage.removeItem(storageKey)
  }
  window.localStorage.setItem(storageKey, JSON.stringify(value))
}

function getStoredValue<Type, Default>(key: string, initialValue: Default | undefined) {
  const existing = getFromLocalStorage<Type>(key)
  return existing == null ? (initialValue as Default) : existing
}

/**
 * A hook to use local storage with a key and an initial value.
 * Similar to useState, but persists the value in local storage.
 */
export function useLocalStorage<Type, Default = Type>(key: string, initialValue?: Default): GetAndSet<Type, Default> {
  type T = Type | Default
  const [storedValue, setStoredValue] = useState(() => getStoredValue<Type, Default>(key, initialValue))

  const setValue = useCallback(
    (setter: SetStateAction<Type>) => {
      const value: T =
        typeof setter === 'function' ? (setter as (prev: T) => T)(getStoredValue(key, initialValue)) : setter
      setStoredValue(value as Default)
      setLocalStorage(key, value)
    },
    [initialValue, key],
  )

  return [storedValue, setValue]
}
