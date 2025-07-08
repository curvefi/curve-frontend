import { kebabCase } from 'lodash'
import { useMemo } from 'react'
import type { Address } from '@curvefi/prices-api'
import type { ColumnFiltersState } from '@tanstack/table-core'
import { isBetaDefault } from '@ui-kit/utils'
import { useStoredState } from './useStoredState'

export function getFromLocalStorage<T>(storageKey: string): T | null {
  if (typeof window === 'undefined') {
    return null
  }
  const item = window.localStorage.getItem(storageKey)
  return item && JSON.parse(item)
}

const get = <T>(key: string, initialValue: T): T => {
  const existing = getFromLocalStorage<T>(key)
  return existing == null ? initialValue : existing
}

const set = <T>(storageKey: string, value: T) => {
  if (value == null) {
    return window.localStorage.removeItem(storageKey)
  }
  window.localStorage.setItem(storageKey, JSON.stringify(value))
}

/**
 * A hook to use local storage with a key and an initial value.
 * Similar to useState, but persists the value in local storage.
 *
 * It is not exported, as we want to keep an overview of all the local storage keys used in the app.
 */
const useLocalStorage = <T>(key: string, initialValue: T) => useStoredState<T>({ key, initialValue, get, set })

/* -- Export specific hooks so that we can keep an overview of all the local storage keys used in the app -- */
export const useShowTestNets = () => useLocalStorage<boolean>('showTestnets', false)
export const useBetaFlag = () => useLocalStorage<boolean>('beta', isBetaDefault)
export const useFilterExpanded = (tableTitle: string) =>
  useLocalStorage<boolean>(`filter-expanded-${kebabCase(tableTitle)}`, false)

export const useTableFilters = (tableTitle: string, defaultFilters: ColumnFiltersState) =>
  useLocalStorage<ColumnFiltersState>(
    `table-filters-${kebabCase(tableTitle)}`,
    useMemo(() => [], []),
  )

export const getFavoriteMarkets = () => getFromLocalStorage<Address[]>('favoriteMarkets') ?? []
export const useFavoriteMarkets = () => {
  const initialValue = useMemo(() => [], [])
  return useLocalStorage<Address[]>('favoriteMarkets', initialValue)
}
