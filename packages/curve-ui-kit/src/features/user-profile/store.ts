import { create, type StateCreator } from 'zustand'
import { devtools, persist } from 'zustand/middleware'
import type { PersistOptions } from 'zustand/middleware/persist'
import merge from 'lodash/merge'
import type { Locale } from '@ui-kit/lib/i18n'
import type { ThemeKey } from '@ui-kit/themes/basic-theme'

type State = {
  theme: ThemeKey
  locale: Locale['value']
  /** Key is either 'global' or a chainIdPoolId from getChainPoolIdActiveKey. */
  maxSlippage: { global: string } & Partial<Record<string, string>>
  isAdvancedMode: boolean
}

type Action = {
  reset: () => void
  setTheme: (theme: ThemeKey) => void
  setLocale: (locale: Locale['value']) => void
  /**
   * Sets or removes a max slippage value for a given key.
   * @param slippage - The slippage value as a string percentage (e.g. "0.1" for 0.1%), or null to remove
   * @param key - Optional key to set slippage for (e.g. "router" or chainId-poolId). If omitted, sets slippage to all existing keys.
   * @returns boolean - True if slippage was successfully set/removed, false if invalid input
   * @example
   * // Set router slippage to 0.1%
   * setMaxSlippage("0.1", "router")
   *
   * // Remove slippage for specific pool
   * setMaxSlippage(null, "1-0x123...")
   */
  setMaxSlippage: (slippage: string | null, key?: string) => boolean
  setAdvancedMode: (isAdvanced: boolean) => void
}

type Store = State & Action

const INITIAL_THEME =
  typeof window !== 'undefined'
    ? window.matchMedia('(prefers-color-scheme: dark)').matches
      ? 'dark'
      : 'light'
    : 'light'

const INITIAL_STATE: State = {
  theme: INITIAL_THEME,
  locale: 'en',
  maxSlippage: { global: '0.1' },
  isAdvancedMode: false,
}

const store: StateCreator<Store> = (set) => ({
  ...INITIAL_STATE,
  reset: () => set(INITIAL_STATE),
  setTheme: (theme) => set((state) => ({ ...state, theme })),
  setLocale: (locale) => set((state) => ({ ...state, locale })),

  setMaxSlippage: (maxSlippage: string | null, key?: string) => {
    // Check if we want to delete a slippage value first.
    if (maxSlippage === null) {
      if (key) {
        set((state) => {
          const newMaxSlippage = { ...state.maxSlippage }
          delete newMaxSlippage[key]
          return { ...state, maxSlippage: newMaxSlippage }
        })

        return true
      }

      return false
    }

    // Instead, we want to add or modify a slippage value.
    const slippage = Number(maxSlippage)
    if (isNaN(slippage) || slippage <= 0) return false

    // Set slippage for a key, but if none given all existing keys will be overwritten.
    // Make sure there's at least a 'router' key.
    set((state) => ({
      ...state,
      maxSlippage: key
        ? { ...state.maxSlippage, [key]: maxSlippage }
        : Object.keys(state.maxSlippage).reduce((acc, k) => ({ ...acc, [k]: maxSlippage }), { global: maxSlippage }),
    }))

    return true
  },

  setAdvancedMode: (isAdvancedMode) => set((state) => ({ ...state, isAdvancedMode })),
})

const cache: PersistOptions<Store> = {
  name: 'user-profile',
  merge: (persistedState, currentState) => merge(currentState, persistedState),
  version: 1,
}

const useUserProfileStore =
  process.env.NODE_ENV === 'development' ? create(devtools(persist(store, cache))) : create(persist(store, cache))

export default useUserProfileStore
