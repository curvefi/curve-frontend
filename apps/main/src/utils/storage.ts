import type { Theme } from '@/store/createGlobalSlice'

import merge from 'lodash/merge'

import { findLocale } from '@/lib/i18n'

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
    let locale = 'en'
    let themeType: Theme = 'default'

    if (parsedStoredValue.locale) {
      const foundLocale = findLocale(parsedStoredValue.locale)
      if (foundLocale) {
        locale = foundLocale.value
      }
    }

    if (parsedStoredValue.themeType) {
      const foundThemeType = ['default', 'dark', 'chad'].find((t) => t === parsedStoredValue.themeType) as Theme
      if (foundThemeType) {
        themeType = foundThemeType
      }
    }

    return {
      walletName: parsedStoredValue.walletName || '',
      themeType,
      locale,
    }
  } else if (key === 'APP_DASHBOARD') {
    return {
      addresses: Array.isArray(parsedStoredValue.addresses)
        ? (parsedStoredValue.addresses as string[])
        : ([] as string[]),
    }
  }
}

export function setStorageValue<T>(key: Key, updatedValue: T) {
  const storedValue = getStorageValue(key)
  const mergedStoredValue = merge(storedValue, updatedValue)
  window.localStorage.setItem(APP_STORAGE[key], JSON.stringify(mergedStoredValue))
}
