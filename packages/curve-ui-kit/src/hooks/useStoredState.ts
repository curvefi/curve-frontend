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
}: StoredStateOptions<T> & Pick<MigrationOptions<T>, 'version'>) {
  const newKey = `${key}-v${version}`
  const oldKey = `${key}${version <= 1 ? '' : `-v${version - 1}`}` // we didn't have versions before v1
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
}: StoredStateOptions<T>): GetAndSet<T> {
  const fullKey = `${key}${version ? `-v${version}` : ''}`
  const [stateValue, setStateValue] = useState<T>(get(fullKey, initialValue))
  const setValue = useCallback(
    (setter: SetStateAction<T>) => {
      const value: T = typeof setter === 'function' ? (setter as (prev: T) => T)(get(fullKey, initialValue)) : setter
      set(fullKey, value)
      setStateValue(value)
      storageEvent.dispatchEvent(new Event(fullKey))
    },
    [get, initialValue, fullKey, set],
  )

  useEffect(() => {
    const listener = () => setStateValue(get(fullKey, initialValue))
    if (version && runMigration({ key, initialValue, get, set, version, migrate })) {
      listener() // update state if migration ran
    }

    // Update state when other components update the local storage
    storageEvent.addEventListener(fullKey, listener)
    return () => storageEvent.removeEventListener(fullKey, listener)
  }, [get, initialValue, fullKey, set, migrate, version, key])

  return [stateValue, setValue]
}
