import { kebabCase } from 'lodash'
import type { Address } from '@curvefi/prices-api'
import { isBetaDefault } from '@ui-kit/utils'
import { useStoredState } from './useStoredState'

export function getFromLocalStorage<T>(storageKey: string): T | null {
  const item = window.localStorage.getItem(storageKey)
  return item && JSON.parse(item)
}

/**
 * A hook to use local storage with a key and an initial value.
 * Similar to useState, but persists the value in local storage.
 *
 * It is not exported, as we want to keep an overview of all the local storage keys used in the app.
 */
const useLocalStorage = <Type, Default = Type>(key: string, initialValue?: Default) =>
  useStoredState<Type, Default>({
    key,
    initialValue,
    get: (key: string, initialValue?: Default): Type | Default => {
      const existing = getFromLocalStorage<Type>(key)
      return existing == null ? (initialValue as Default) : existing
    },
    set: (storageKey: string, value: Type | Default) => {
      if (value == null) {
        return window.localStorage.removeItem(storageKey)
      }
      window.localStorage.setItem(storageKey, JSON.stringify(value))
    },
  })

/* -- Export specific hooks so that we can keep an overview of all the local storage keys used in the app -- */
export const useShowTestNets = () => useLocalStorage<boolean>('showTestnets', false)
export const useBetaFlag = () => useLocalStorage<boolean>('beta', isBetaDefault)
export const useWalletName = () => useLocalStorage<string | null>('walletName', null)
export const useFilterExpanded = (tableTitle: string) =>
  useLocalStorage<boolean>(`filter-expanded-${kebabCase(tableTitle)}`)

export const getFavoriteMarkets = () => getFromLocalStorage<Address[]>('favoriteMarkets') ?? []
export const useFavoriteMarkets = () => useLocalStorage<Address[]>('favoriteMarkets', [])
