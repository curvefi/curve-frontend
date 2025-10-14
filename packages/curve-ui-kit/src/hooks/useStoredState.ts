import { isEqual } from 'lodash'
import { Dispatch, SetStateAction, useCallback, useEffect, useState } from 'react'

export type GetAndSet<T> = [T, Dispatch<SetStateAction<T>>]

const storageEvent = new EventTarget()

export type MigrationOptions<T> = {
  /**
   * Version of the stored value. When increased, the migrate function is called (if provided) to migrate old values to new values.
   */
  version: number
  /**
   * Optional function to migrate old values to new values when version is increased.
   * If not provided, old values are simply removed.
   */
  migrate?: (oldValue: T, initialValue: T) => T | null

  /**
   * (Optional) old key format, if different from the new key format. Used to support migration from old key formats.
   * If not provided, the old key is assumed to be `${key}-v${version - 1}` or `${key}` for v1.
   */
  oldKey?: string
}

type StoredStateOptions<T> = Partial<MigrationOptions<T>> & {
  key: string
  initialValue: T
  get: (key: string, initialValue: T) => T
  set: (key: string, value: T | null) => unknown
}

/**
 * Run migration of stored values if needed.
 */
function runMigration<T>({
  key,
  initialValue,
  get,
  set,
  version,
  migrate,
  oldKey = `${key}${version <= 1 ? '' : `-v${version - 1}`}`, // we didn't have versions before v1
}: StoredStateOptions<T> & Omit<MigrationOptions<T>, 'migrate'>) {
  const newKey = `${key}-v${version}`
  const oldValue = get(oldKey, initialValue)
  if (isEqual(oldValue, initialValue)) {
    return false // no previous value to migrate
  }
  const newValue = migrate?.(oldValue, initialValue) ?? initialValue
  set(newKey, newValue)
  set(oldKey, null)
  console.info(`Migrated storage key ${oldKey} to ${newKey}`, { oldValue, newValue })
  return true // migration ran
}

/**
 * Hook for storage similar to useState, but allowing custom get/set functions.
 * Allows for migration of old values when version is increased.
 */
export function useStoredState<T>({
  key,
  initialValue,
  get,
  set,
  version,
  migrate,
  oldKey,
}: StoredStateOptions<T>): GetAndSet<T> {
  const fullKey = `${key}${version ? `-v${version}` : ''}`
  const [stateValue, setState] = useState<T>(get(fullKey, initialValue))
  const setStateValue = useCallback((value: T) => setState((old) => (isEqual(old, value) ? old : value)), [])

  const setValue = useCallback(
    (setter: SetStateAction<T>) => {
      const value: T = typeof setter === 'function' ? (setter as (prev: T) => T)(get(fullKey, initialValue)) : setter
      set(fullKey, value)
      setStateValue(value)
      storageEvent.dispatchEvent(new Event(fullKey))
    },
    [get, initialValue, fullKey, set, setStateValue],
  )

  useEffect(() => {
    const listener = () => setStateValue(get(fullKey, initialValue))
    if (version) runMigration({ key, initialValue, get, set, version, migrate, oldKey })
    listener() // update state if migration ran or if fullKey changes

    // Update state when other components update the local storage
    storageEvent.addEventListener(fullKey, listener)
    return () => storageEvent.removeEventListener(fullKey, listener)
  }, [get, initialValue, fullKey, set, migrate, version, key, oldKey, setStateValue])

  return [stateValue, setValue]
}
