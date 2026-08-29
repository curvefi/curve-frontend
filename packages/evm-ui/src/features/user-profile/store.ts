import lodash from 'lodash'
import { create, type StateCreator } from 'zustand'
import { devtools, persist, type PersistOptions } from 'zustand/middleware'
import type { ThemeKey } from '@evm-ui/themes/basic-theme'
import { SLIPPAGE, type SlippageSettings } from '@evm-ui/widgets/SlippageSettings/slippage.utils'
import { mapRecord } from '@primitives/objects.utils'

type RateDisplay = 'apr' | 'apy'

type UserProfileState = {
  theme: ThemeKey
  maxSlippage: SlippageSettings
  showDeprecatedMarkets: boolean
  rateDisplay: RateDisplay
}

type Action = {
  reset: () => void
  setTheme: (theme: ThemeKey) => void
  setMaxSlippage: (settings: SlippageSettings) => void
  setShowDeprecatedMarkets: (showDeprecatedMarkets: boolean) => void
  setRateDisplay: (rateDisplay: RateDisplay) => void
}

type Store = UserProfileState & Action

const INITIAL_STATE: UserProfileState = {
  theme: window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light',
  maxSlippage: mapRecord(SLIPPAGE, (_, v) => v.default),
  showDeprecatedMarkets: false,
  rateDisplay: 'apy',
}

const store: StateCreator<Store> = set => ({
  ...INITIAL_STATE,
  reset: () => set(INITIAL_STATE),
  setTheme: theme => set(state => ({ ...state, theme })),
  setMaxSlippage: maxSlippage => set(state => ({ ...state, maxSlippage })),
  setShowDeprecatedMarkets: (showDeprecatedMarkets: boolean) => set(state => ({ ...state, showDeprecatedMarkets })),
  setRateDisplay: rateDisplay => set(state => ({ ...state, rateDisplay })),
})

const cache: PersistOptions<Store> = {
  name: 'user-profile',
  merge: (persistedState, currentState) => lodash.merge(currentState, persistedState),
  version: 1,
}

export const useUserProfileStore =
  process.env.NODE_ENV === 'development' ? create(devtools(persist(store, cache))) : create(persist(store, cache))
