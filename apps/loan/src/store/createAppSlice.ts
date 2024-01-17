import type { GetState, SetState } from 'zustand'
import type { State } from '@/store/useStore'
import type { Locale } from '@/lib/i18n'

import produce from 'immer'

import { initCurveJs } from '@/utils/utilsCurvejs'
import { log } from '@/utils/helpers'
import { setStorageValue } from '@/utils/storage'
import isEqual from 'lodash/isEqual'
import networks from '@/networks'

export type DefaultStateKeys = keyof typeof DEFAULT_STATE
export type SliceKey = keyof State | ''
export type StateKey = string

type AppCacheKeys = 'appNetworkId' | 'themeType' | 'isAdvanceMode'

type SliceState = {
  appNetworkId: ChainId | null
  routerAppNetworkId: ChainId | null
  curve: Curve | null
  crvusdTotalSupply: { amount: string | null; error: string }
  isAdvanceMode: boolean
  isErrorApi: boolean
  isLoadingApi: boolean
  isMobile: boolean
  isPageVisible: boolean
  loading: boolean
  locale: Locale['value']
  maxSlippage: string
  routerProps: RouterProps | null
  scrollY: number
  themeType: Theme
}

export interface AppSlice extends SliceState {
  fetchCrvUSDTotalSupply(api: Curve): Promise<void>
  setAppCache<T>(key: AppCacheKeys, value: T): void
  updateCurveJs(appNetworkId: ChainId, wallet: Wallet | null): Promise<void>
  updateGlobalStoreByKey<T>(key: DefaultStateKeys, value: T): void

  setAppStateByActiveKey<T>(sliceKey: SliceKey, key: StateKey, activeKey: string, value: T, showLog?: boolean): void
  setAppStateByKey<T>(sliceKey: SliceKey, key: StateKey, value: T, showLog?: boolean): void
  setAppStateByKeys<T>(sliceKey: SliceKey, sliceState: Partial<T>, showLog?: boolean): void
  resetAppState<T>(sliceKey: SliceKey, defaultState: T): void
}

const DEFAULT_STATE: SliceState = {
  appNetworkId: null,
  routerAppNetworkId: null,
  curve: null,
  crvusdTotalSupply: { amount: '', error: '' },
  isAdvanceMode: false,
  isErrorApi: false,
  isLoadingApi: true,
  isMobile: false,
  isPageVisible: true,
  loading: true,
  locale: 'en' as const,
  maxSlippage: '0.1',
  routerProps: null,
  scrollY: 0,
  themeType: 'default',
}

const createAppSlice = (set: SetState<State>, get: GetState<State>) => ({
  ...DEFAULT_STATE,

  fetchCrvUSDTotalSupply: async (api: Curve) => {
    const chainId = api.chainId
    const fetchedTotalSupply = await networks[chainId].api.helpers.getTotalSupply(api)
    get().updateGlobalStoreByKey('crvusdTotalSupply', fetchedTotalSupply)
    if (!fetchedTotalSupply.error) {
      get().storeCache.setStateByActiveKey('crvusdTotalSupply', chainId.toString(), fetchedTotalSupply.amount)
    }
  },
  setAppCache: <T>(key: AppCacheKeys, value: T) => {
    get().updateGlobalStoreByKey(key, value)
    setStorageValue('APP_CACHE', {
      appNetworkId: key === 'appNetworkId' ? value : get().appNetworkId || 1,
      themeType: key === 'themeType' ? value : get().themeType || 'default',
      isAdvanceMode: key === 'isAdvanceMode' ? value : get().isAdvanceMode || false,
    })
  },
  updateCurveJs: async (appNetworkId: ChainId, wallet: Wallet | null) => {
    log('updateCurveJs', appNetworkId, { wallet })

    get().updateGlobalStoreByKey('isErrorApi', false)
    get().updateGlobalStoreByKey('isLoadingApi', true)
    const prevChainId = get().curve?.chainId
    const isNetworkSwitch = !!prevChainId && prevChainId !== appNetworkId
    const prevSignerAddress = get().curve?.signerAddress
    const walletSignerAddress = wallet?.accounts?.[0]?.address
    const isSwitchSigner = !!prevSignerAddress && !!walletSignerAddress && prevSignerAddress !== walletSignerAddress

    // reset store
    if (isNetworkSwitch) {
      // add resetState once it is available to > 1 network
    }

    const api = await initCurveJs(appNetworkId, wallet)
    // TODO: hard coding chainId to 1
    const curveApi = { ...api, chainId: 1 } as Curve

    if (api) {
      get().updateGlobalStoreByKey('curve', curveApi)

      const callAdditionalApis = !prevChainId || isNetworkSwitch
      const haveSigner = !!curveApi.signerAddress

      // get collateral list
      const { collateralDatas } = await get().collaterals.fetchCollaterals(curveApi)

      if (callAdditionalApis) {
        get().gas.fetchGasInfo(curveApi)
        get().usdRates.fetchAllStoredUsdRates(curveApi)
        get().fetchCrvUSDTotalSupply(curveApi)
      }

      await get().loans.fetchLoansDetails(curveApi, collateralDatas)

      if (!haveSigner || isSwitchSigner) {
        get().loans.setStateByKey('userWalletBalancesMapper', {})
        get().loans.setStateByKey('userDetailsMapper', {})
        get().updateGlobalStoreByKey('isLoadingApi', false)
      } else {
        get().updateGlobalStoreByKey('isLoadingApi', false)
      }
    }
  },
  updateGlobalStoreByKey: <T>(key: DefaultStateKeys, value: T) => {
    set(
      produce((state) => {
        state[key] = value
      })
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
      })
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
      })
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
        })
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
      })
    )
  },
})

export default createAppSlice

// HELPERS
