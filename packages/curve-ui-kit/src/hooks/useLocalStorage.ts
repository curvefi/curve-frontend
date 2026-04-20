import lodash from 'lodash'
import { useCallback, useMemo } from 'react'
import type { Address } from '@primitives/address.utils'
import type { VisibilityVariants } from '@ui-kit/shared/ui/DataTable/visibility.types'
import { Duration } from '@ui-kit/themes/design/0_primitives'
import { defaultReleaseChannel, ReleaseChannel } from '@ui-kit/utils'
import { getStorageKey, type MigrationOptions, useStoredState } from './useStoredState'

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

const [ReleaseChannelKey, ReleaseChannelVersion] = ['release-channel', 1] as const
export const getReleaseChannel = () =>
  getFromLocalStorage<ReleaseChannel>(getStorageKey(ReleaseChannelKey, ReleaseChannelVersion)) ?? defaultReleaseChannel
export const useReleaseChannel = () =>
  useLocalStorage<ReleaseChannel>(ReleaseChannelKey, defaultReleaseChannel, {
    version: ReleaseChannelVersion,
    migrate: (oldValue) => (oldValue ? ReleaseChannel.Beta : ReleaseChannel.Stable),
    oldKey: 'beta',
  })

export const useFilterExpanded = (tableTitle: string) =>
  useLocalStorage<boolean>(`filter-expanded-${kebabCase(tableTitle)}`, false)

type RateType = 'borrow' | 'supply'

export const useShowNetRate = (type: RateType) =>
  useLocalStorage<Record<string, boolean>>(
    {
      borrow: 'showNetApr',
      supply: 'showNetApy',
    }[type],
    useMemo(() => ({}), []),
  )

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

const FavoriteMarketsKey = 'favoriteMarkets'
export const getFavoriteMarkets = () => getFromLocalStorage<Address[]>(FavoriteMarketsKey) ?? []
export const useFavoriteMarkets = () => {
  const initialValue = useMemo(() => [], [])
  return useLocalStorage<Address[]>(FavoriteMarketsKey, initialValue)
}

export const useBandsChartVisible = () => useLocalStorage<boolean>('bands-chart-visible', false)

/**
 * Returns a tuple containing a boolean indicating whether the banner should be shown, and a function to dismiss the banner.
 * Do NOT export this hook, as it directly exposes local storage keys!
 */
const useDismissBanner = (bannerKey: string, frequency: keyof typeof Duration.Banner = 'Monthly') => {
  const [dismissedAt, setDismissedAt] = useLocalStorage<number | null>(bannerKey, null)
  const expirationTime = Duration.Banner[frequency]

  const shouldShowBanner = useMemo(
    () => dismissedAt == null || Date.now() - dismissedAt >= expirationTime, // Show if dismissed longer than expiration
    [dismissedAt, expirationTime],
  )

  const dismissBanner = useCallback(() => setDismissedAt(Date.now()), [setDismissedAt])

  return [shouldShowBanner, dismissBanner] as const
}

export const useDismissAaveBanner = () => useDismissBanner('aave-v2-frozen-avalanche-polygon')

export const useDismissFastBridgeBanner = () => useDismissBanner('fast-bridge-paused', 'Daily')

export const useDismissCurveLiteBanner = (chainId: number) => useDismissBanner(`curve-lite-${chainId}`)

export const useDismissPhishingWarn = () => useDismissBanner('phishing-warning-dismissed')

export const useDismissPoolBanner = (network: string, poolId: string) =>
  useDismissBanner(['pool-alert-banner-dismissed', network, poolId].join('-'), 'Daily')
