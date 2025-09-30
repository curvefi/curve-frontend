import lodash from 'lodash'
import { type MigrationOptions, useStoredState } from './useStoredState'

const { kebabCase } = lodash

function getFromSessionStorage<T>(storageKey: string): T | null {
  if (typeof window === 'undefined') {
    return null
  }
  const item = window.sessionStorage.getItem(storageKey)
  return item && JSON.parse(item)
}

const get = <T>(key: string, initialValue: T): T => {
  const existing = getFromSessionStorage<T>(key)
  return existing == null ? initialValue : existing
}

const set = <T>(storageKey: string, value: T) => {
  if (value == null) {
    return window.sessionStorage.removeItem(storageKey)
  }
  window.sessionStorage.setItem(storageKey, JSON.stringify(value))
}

/**
 * A hook to use session storage with a key and an initial value.
 * Similar to useState, but persists the value in session storage.
 *
 * It is not exported, as we want to keep an overview of all the storage keys used in the app.
 */
const useSessionStorage = <T>(key: string, initialValue: T, migration?: MigrationOptions<T>) =>
  useStoredState<T>({ key, initialValue, get, set, ...migration })

export const usePhishingWarningDismissed = () => useSessionStorage<boolean>(`phishing-warning-dismissed`, false)
