import { merge } from 'lodash'
import { toArray } from '@primitives/array.utils'
import { setLocalStorageItem } from '@ui-kit/hooks/useLocalStorage'

const APP_STORAGE = {
  APP_DASHBOARD: 'curve-app-dashboard',
}

type Key = keyof typeof APP_STORAGE

export function getStorageValue(key: Key) {
  const storedValue = window.localStorage?.getItem(APP_STORAGE[key])
  let parsedStoredValue: Record<string, string> = {}

  if (storedValue) {
    try {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment -- Existing violation before enabling this rule.
      parsedStoredValue = JSON.parse(storedValue) ?? {}
    } catch (error) {
      console.error(error)
    }
  }

  if (key === 'APP_DASHBOARD') {
    return { addresses: toArray(parsedStoredValue.addresses) }
  }
}

export function setStorageValue<T>(key: Key, updatedValue: T) {
  const storedValue = getStorageValue(key)
  const mergedStoredValue = merge(storedValue, updatedValue)
  setLocalStorageItem(APP_STORAGE[key], JSON.stringify(mergedStoredValue))
}
