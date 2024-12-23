import type { GetState, SetState } from 'zustand'
import type { State } from '@/store/useStore'
import type { ConnectState } from '@/ui/utils'
import produce from 'immer'
import { log } from '@ui-kit/lib/logging'
import { setStorageValue } from '@/utils/utilsStorage'
import isEqual from 'lodash/isEqual'
import type { ThemeKey } from 'curve-ui-kit/src/themes/basic-theme'
import { LocaleValue } from '@/lib/i18n'
import { prefetchMarkets } from '@/entities/chain/chain-query'

export type DefaultStateKeys = keyof typeof DEFAULT_STATE
export type SliceKey = keyof State | ''
export type StateKey = string

type AppCacheKeys = 'themeType' | 'isAdvanceMode'

type SliceState = {
  connectState: ConnectState
  api: Api | null
  isAdvanceMode: boolean
  isLoadingApi: boolean
  isLoadingCurve: true
  isMobile: boolean
  isPageVisible: boolean
  locale: LocaleValue
  maxSlippage: string
  routerProps: RouterProps | null
  scrollY: number
  themeType: ThemeKey
}

// prettier-ignore
export interface AppSlice extends SliceState {
  setAppCache<T>(key: AppCacheKeys, value: T): void
  updateConnectState(status: ConnectState['status'], stage: ConnectState['stage'], options?: ConnectState['options']): void
  updateApi(api: Api, prevApi: Api | null, wallet: Wallet | null): Promise<void>
  updateGlobalStoreByKey<T>(key: DefaultStateKeys, value: T): void
  setAppStateByActiveKey<T>(sliceKey: SliceKey, key: StateKey, activeKey: string, value: T, showLog?: boolean): void
  setAppStateByKey<T>(sliceKey: SliceKey, key: StateKey, value: T, showLog?: boolean): void
  setAppStateByKeys<T>(sliceKey: SliceKey, sliceState: Partial<T>, showLog?: boolean): void
  resetAppState<T>(sliceKey: SliceKey, defaultState: T): void
}

const DEFAULT_STATE: SliceState = {
  connectState: { status: '' as const, stage: '' },
  api: null,
  isAdvanceMode: false,
  isLoadingApi: true,
  isLoadingCurve: true,
  isMobile: false,
  isPageVisible: true,
  locale: 'en' as const,
  maxSlippage: '0.1',
  routerProps: null,
  scrollY: 0,
  themeType: 'light',
}

const createAppSlice = (set: SetState<State>, get: GetState<State>): AppSlice => ({
  ...DEFAULT_STATE,

  setAppCache: <T>(key: AppCacheKeys, value: T) => {
    get().updateGlobalStoreByKey(key, value)
    setStorageValue('APP_CACHE', {
      themeType: key === 'themeType' ? value : get().themeType || 'default',
      isAdvanceMode: key === 'isAdvanceMode' ? value : get().isAdvanceMode || false,
    })
  },
  updateConnectState: (status, stage, options) => {
    const value = options ? { status, stage, options } : { status, stage }
    get().updateGlobalStoreByKey('connectState', value)
  },
  updateApi: async (api, prevApi, wallet) => {
    const isNetworkSwitched = !!prevApi?.chainId && prevApi.chainId !== api.chainId
    const isUserSwitched = !!prevApi?.signerAddress && prevApi.signerAddress !== api.signerAddress
    const state = get()

    log('updateApi', api?.chainId, {
      wallet: wallet?.chains[0]?.id ?? '',
      isNetworkSwitched,
      isUserSwitched,
    })

    // reset store
    if (isNetworkSwitched) {
      Object.keys(get()).forEach((stateKey) => {
        if (
          stateKey.startsWith('loan') ||
          stateKey.startsWith('user') ||
          stateKey === 'tokens' ||
          stateKey === 'chartBands' ||
          stateKey === 'campaigns'
        ) {
          // @ts-ignore
          if ('resetState' in get()[stateKey]) get()[stateKey].resetState()
        }
      })
    }

    if (isUserSwitched || !api.signerAddress) {
      state.user.resetState()
    }

    // update network settings from api
    state.updateGlobalStoreByKey('api', api)
    state.updateGlobalStoreByKey('isLoadingCurve', false)

    // unfortunately, we cannot use markets from the cache as that leaves curve-lending-js in an inconsistent state
    await prefetchMarkets({ chainId: api.chainId })
    state.updateGlobalStoreByKey('isLoadingApi', false)
  },
  updateGlobalStoreByKey: <T>(key: DefaultStateKeys, value: T) => {
    set(
      produce((state) => {
        state[key] = value
      }),
    )
  },
  setAppStateByActiveKey: <T>(sliceKey: SliceKey, key: StateKey, activeKey: string, value: T, showLog?: boolean) => {
    set(
      produce((state) => {
        const storedValues = state[sliceKey][key]
        const storedActiveKeyValues = storedValues[activeKey]
        if (typeof storedValues === 'undefined') {
          const parsedValue = { [activeKey]: value }
          if (!isEqual(storedActiveKeyValues, parsedValue)) {
            if (showLog) {
              log(`%c state: ${key}`, 'background: #222; color: #ffff3f', parsedValue)
            }
            state[sliceKey][key] = parsedValue
          }
        } else if (typeof storedValues === 'object') {
          const parsedValue = { ...storedValues, [activeKey]: value }
          if (!isEqual(storedActiveKeyValues, parsedValue)) {
            if (showLog) {
              log(`%c state: ${key}`, 'background: #222; color: #ffff3f', parsedValue)
            }
            state[sliceKey][key] = parsedValue
          }
        }
      }),
    )
  },
  setAppStateByKey: <T>(sliceKey: SliceKey, key: StateKey, value: T, showLog?: boolean) => {
    set(
      produce((state) => {
        const storedValue = state[sliceKey][key]
        if (!isEqual(storedValue, value)) {
          if (showLog) {
            log(`%c state: ${key}`, 'background: #222; color: #d4d700', value)
          }
          state[sliceKey][key] = value
        }
      }),
    )
  },
  setAppStateByKeys: <T>(sliceKey: SliceKey, sliceState: T, showLog?: boolean) => {
    for (const key in sliceState) {
      const value = sliceState[key]
      set(
        produce((state) => {
          const storedValue = state[sliceKey][key]
          if (!isEqual(storedValue, value)) {
            if (showLog) {
              log(`%c state: ${key}`, 'background: #222; color: #55a630', value)
            }
            state[sliceKey][key] = value
          }
        }),
      )
    }
  },
  resetAppState: <T>(sliceKey: SliceKey, defaultState: T) => {
    set(
      produce((state) => {
        state[sliceKey] = {
          ...state[sliceKey],
          ...defaultState,
        }
      }),
    )
  },
})

export default createAppSlice

// HELPERS
