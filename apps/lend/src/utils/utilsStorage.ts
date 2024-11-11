import merge from 'lodash/merge'
import dayjs from 'dayjs'
import { ThemeKey } from '@ui-kit/shared/lib'

export const APP_STORAGE = {
  APP_CACHE: 'lend-app-cache',
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
      timestamp: parsedStoredValue.timestamp ?? '',
      walletName: getWalletName(parsedStoredValue.walletName, parsedStoredValue.timestamp),
      isAdvanceMode: parsedStoredValue.isAdvanceMode ?? false,
    }
  }
}

function getTheme(svThemeType: string | undefined) {
  if (svThemeType) {
    const foundThemeType = ['default', 'dark', 'chad'].find((t) => t === svThemeType) as ThemeKey
    return (foundThemeType || 'default') as ThemeKey
  }
}

function getWalletName(walletName: string | undefined, timestamp: string | undefined) {
  const isStaled = walletName && timestamp && dayjs().diff(+timestamp, 'days') > 5
  return isStaled || !walletName ? '' : walletName
}

export function setStorageValue<T>(key: Key, updatedValue: T) {
  const storedValue = getStorageValue(key)
  const mergedStoredValue = merge(storedValue, updatedValue)
  window.localStorage.setItem(APP_STORAGE[key], JSON.stringify(mergedStoredValue))
}
