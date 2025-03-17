import { produce } from 'immer'
import merge from 'lodash/merge'
import { create, type StateCreator } from 'zustand'
import { devtools, persist } from 'zustand/middleware'
import type { PersistOptions } from 'zustand/middleware/persist'
import type { ThemeKey } from '@ui-kit/themes/basic-theme'

type State = {
  theme: ThemeKey
  /** Key is either 'crypto', 'stable' or a chainIdPoolId from getChainPoolIdActiveKey. */
  maxSlippage: { crypto: string; stable: string } & Partial<Record<string, string>>
  isAdvancedMode: boolean
  hideSmallPools: boolean
}

type Action = {
  reset: () => void
  setTheme: (theme: ThemeKey) => void
  /**
   * Sets or removes a max slippage value for a given key.
   * @param slippage - The slippage value as a string percentage (e.g. "0.1" for 0.1%), or null to remove
   * @param key - Optional key to set slippage for (e.g. "crypto", "stable" or chainId-poolId). If omitted, sets slippage to all existing keys.
   * @returns boolean - True if slippage was successfully set/removed, false if invalid input
   * @example
   * // Set router slippage to 0.1%
   * setMaxSlippage("0.1", "crypto")
   *
   * // Set router slippage to 0.03% for a stableswap pool
   * setMaxSlippage("0.03", "stable")
   *
   * // Remove slippage for specific pool
   * setMaxSlippage(null, "1-0x123...")
   */
  setMaxSlippage: (slippage: string | null, key?: string) => boolean
  setAdvancedMode: (isAdvanced: boolean) => void
  setHideSmallPools: (hideSmallPools: boolean) => void
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
  maxSlippage: { crypto: '0.1', stable: '0.03' },
  isAdvancedMode: false,
  hideSmallPools: true,
}

const store: StateCreator<Store> = (set) => ({
  ...INITIAL_STATE,
  reset: () => set(INITIAL_STATE),
  setTheme: (theme) => set((state) => ({ ...state, theme })),
  setMaxSlippage: (maxSlippage: string | null, key?: string) => {
    // Check if we want to delete a slippage value first.
    if (maxSlippage === null) {
      if (!key) return false
      if (key === 'crypto' || key === 'stable') return false

      set(
        produce((state) => {
          delete state.maxSlippage[key]
        }),
      )

      return true
    }

    // Instead, we want to add or modify a slippage value.
    const slippage = Number(maxSlippage)
    if (isNaN(slippage) || slippage <= 0) return false

    // Set slippage for a key, but if none given all existing keys will be overwritten.
    set(
      produce((state) => {
        if (key) {
          state.maxSlippage[key] = maxSlippage
        } else {
          for (const k of Object.keys(state.maxSlippage)) {
            state.maxSlippage[k] = maxSlippage
          }
        }
      }),
    )

    return true
  },

  setAdvancedMode: (isAdvancedMode) => set((state) => ({ ...state, isAdvancedMode })),
  setHideSmallPools: (hideSmallPools) => set((state) => ({ ...state, hideSmallPools })),
})

const cache: PersistOptions<Store> = {
  name: 'user-profile',
  merge: (persistedState, currentState) => merge(currentState, persistedState),
  version: 1,
}

const useUserProfileStore =
  process.env.NODE_ENV === 'development' ? create(devtools(persist(store, cache))) : create(persist(store, cache))

export default useUserProfileStore
