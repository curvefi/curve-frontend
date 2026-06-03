import lodash from 'lodash'
import { create, type StateCreator } from 'zustand'
import { devtools, persist, type PersistOptions } from 'zustand/middleware'
import type { ThemeKey } from '@ui-kit/themes/basic-theme'
import { type SlippageSettings } from '@ui-kit/widgets/SlippageSettings/slippage.utils'

type UserProfileState = {
  theme: ThemeKey
  maxSlippage: SlippageSettings
  showDeprecatedMarkets: boolean
}

type Action = {
  reset: () => void
  setTheme: (theme: ThemeKey) => void
  setMaxSlippage: (settings: SlippageSettings) => void
  setShowDeprecatedMarkets: (showDeprecatedMarkets: boolean) => void
}

type Store = UserProfileState & Action

const INITIAL_STATE: UserProfileState = {
  theme: window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light',
  maxSlippage: { crypto: '0.1', stable: '0.03', leverage: '0.5' },
  showDeprecatedMarkets: false,
}

const store: StateCreator<Store> = set => ({
  ...INITIAL_STATE,
  reset: () => set(INITIAL_STATE),
  setTheme: theme => set(state => ({ ...state, theme })),
  setMaxSlippage: maxSlippage => set(state => ({ ...state, maxSlippage })),
  setShowDeprecatedMarkets: (showDeprecatedMarkets: boolean) => set(state => ({ ...state, showDeprecatedMarkets })),
})

const cache: PersistOptions<Store> = {
  name: 'user-profile',
  merge: (persistedState, currentState) => lodash.merge(currentState, persistedState),
  version: 1,
}

export const useUserProfileStore =
  process.env.NODE_ENV === 'development' ? create(devtools(persist(store, cache))) : create(persist(store, cache))
