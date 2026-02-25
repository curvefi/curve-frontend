import lodash from 'lodash'
import { useCallback, useMemo } from 'react'
import type { Address } from '@primitives/address.utils'
import type { VisibilityVariants } from '@ui-kit/shared/ui/DataTable/visibility.types'
import { defaultReleaseChannel, ReleaseChannel } from '@ui-kit/utils'
import { type MigrationOptions, useStoredState } from './useStoredState'

const { kebabCase } = lodash

function getFromLocalStorage<T>(storageKey: string): T | null {
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
const useLocalStorage = <T>(key: string, initialValue: T, migration?: MigrationOptions<T>) =>
  useStoredState<T>({ key, initialValue, get, set, ...migration })

/* -- Export specific hooks so that we can keep an overview of all the local storage keys used in the app -- */
export const useShowTestNets = () => useLocalStorage<boolean>('showTestnets', false)

export const getReleaseChannel = () => getFromLocalStorage<ReleaseChannel>('release-channel') ?? defaultReleaseChannel
export const useReleaseChannel = () =>
  useLocalStorage<ReleaseChannel>('release-channel', defaultReleaseChannel, {
    version: 1,
    migrate: (oldValue) => (oldValue ? ReleaseChannel.Beta : ReleaseChannel.Stable),
    oldKey: 'beta',
  })

export const useFilterExpanded = (tableTitle: string) =>
  useLocalStorage<boolean>(`filter-expanded-${kebabCase(tableTitle)}`, false)

export const useCreateLoanPreset = <T extends 'Safe' | 'MaxLtv' | 'Custom'>(defaultValue: T) =>
  useLocalStorage<T>('create-loan-preset', defaultValue)

export const useTableColumnVisibility = <Variant extends string, ColumnIds>(
  tableTitle: string,
  defaultVisibility: VisibilityVariants<Variant, ColumnIds>,
  migration: MigrationOptions<VisibilityVariants<Variant, ColumnIds>>,
) =>
  useLocalStorage<VisibilityVariants<Variant, ColumnIds>>(
    `table-column-visibility-${kebabCase(tableTitle)}`,
    defaultVisibility,
    migration,
  )

export const getFavoriteMarkets = () => getFromLocalStorage<Address[]>('favoriteMarkets') ?? []
export const useFavoriteMarkets = () => {
  const initialValue = useMemo(() => [], [])
  return useLocalStorage<Address[]>('favoriteMarkets', initialValue)
}

export const useDismissBanner = (bannerKey: string, expirationTime: number) => {
  const [dismissedAt, setDismissedAt] = useLocalStorage<number | null>(bannerKey, null)

  const shouldShowBanner = useMemo(
    // eslint-disable-next-line react-hooks/purity
    () => dismissedAt == null || Date.now() - dismissedAt >= expirationTime, // Show if dismissed longer than expiration
    [dismissedAt, expirationTime],
  )

  const dismissBanner = useCallback(() => {
    setDismissedAt(Date.now())
  }, [setDismissedAt])

  return { shouldShowBanner, dismissBanner }
}
