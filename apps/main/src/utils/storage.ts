import type { Theme } from '@/store/createGlobalSlice'

import merge from 'lodash/merge'

export const APP_STORAGE = {
  APP_CACHE: 'curve-app-cache',
  APP_DASHBOARD: 'curve-app-dashboard',
}

type Key = keyof typeof APP_STORAGE

export function getStorageValue(key: Key) {
  const storedValue = window.localStorage.getItem(APP_STORAGE[key])
  let parsedStoredValue: { [key: string]: string } = {}

  if (storedValue) {
    try {
      parsedStoredValue = JSON.parse(storedValue) ?? {}
    } catch (error) {
      console.error(error)
    }
  }

  if (key === 'APP_CACHE') {
    return {
      themeType: getTheme(parsedStoredValue.themeType),
    }
  } else if (key === 'APP_DASHBOARD') {
    return {
      addresses: Array.isArray(parsedStoredValue.addresses)
        ? (parsedStoredValue.addresses as string[])
        : ([] as string[]),
    }
  }
}

function getTheme(svThemeType: string | undefined) {
  if (svThemeType) {
    const foundThemeType = ['default', 'dark', 'chad'].find((t) => t === svThemeType) as Theme
    return (foundThemeType || 'default') as Theme
  }
}

export function setStorageValue<T>(key: Key, updatedValue: T) {
  const storedValue = getStorageValue(key)
  const mergedStoredValue = merge(storedValue, updatedValue)
  window.localStorage.setItem(APP_STORAGE[key], JSON.stringify(mergedStoredValue))
}
