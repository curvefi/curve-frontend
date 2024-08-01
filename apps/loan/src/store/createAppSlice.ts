import type { GetState, SetState } from 'zustand'
import type { State } from '@/store/useStore'
import type { ConnectState } from '@/ui/utils'
import type { Locale } from '@/lib/i18n'

import produce from 'immer'

import { httpFetcher, log } from '@/utils/helpers'
import { setStorageValue } from '@/utils/storage'
import isEqual from 'lodash/isEqual'
import networks from '@/networks'

export type DefaultStateKeys = keyof typeof DEFAULT_STATE
export type SliceKey = keyof State | ''
export type StateKey = string

type AppCacheKeys = 'themeType' | 'isAdvanceMode'

type SliceState = {
  connectState: ConnectState
  curve: Curve | null
  crvusdTotalSupply: { total: string; minted: string; pegKeepersDebt: string; error: string }
  dailyVolume: number | null
  isAdvanceMode: boolean
  isLoadingApi: false
  isLoadingCurve: true
  isMobile: boolean
  isPageVisible: boolean
  locale: Locale['value']
  maxSlippage: string
  routerProps: RouterProps | null
  scrollY: number
  themeType: Theme
}

// prettier-ignore
export interface AppSlice extends SliceState {
  fetchCrvUSDTotalSupply(api: Curve): Promise<void>
  fetchDailyVolume(): Promise<void>
  setAppCache<T>(key: AppCacheKeys, value: T): void
  updateConnectState(status: ConnectState['status'], stage: ConnectState['stage'], options?: ConnectState['options']): void
  updateCurveJs(curve: Curve, prevCurveApi: Curve | null, wallet: Wallet | null): Promise<void>
  updateGlobalStoreByKey<T>(key: DefaultStateKeys, value: T): void

  setAppStateByActiveKey<T>(sliceKey: SliceKey, key: StateKey, activeKey: string, value: T, showLog?: boolean): void
  setAppStateByKey<T>(sliceKey: SliceKey, key: StateKey, value: T, showLog?: boolean): void
  setAppStateByKeys<T>(sliceKey: SliceKey, sliceState: Partial<T>, showLog?: boolean): void
  resetAppState<T>(sliceKey: SliceKey, defaultState: T): void
}

const DEFAULT_STATE: SliceState = {
  connectState: { status: '' as const, stage: '' },
  curve: null,
  crvusdTotalSupply: { total: '', minted: '', pegKeepersDebt: '', error: '' },
  dailyVolume: null,
  isAdvanceMode: false,
  isLoadingApi: false,
  isLoadingCurve: true,
  isMobile: false,
  isPageVisible: true,
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
  },
  fetchDailyVolume: async () => {
    const { updateGlobalStoreByKey } = get()
    try {
      const resp = await httpFetcher('https://api.curve.fi/api/getVolumes/ethereum/crvusd-amms')
      updateGlobalStoreByKey('dailyVolume', resp.data?.totalVolume ?? 'NaN')
    } catch (error) {
      console.error(error)
      updateGlobalStoreByKey('dailyVolume', 'NaN')
    }
  },
  setAppCache: <T>(key: AppCacheKeys, value: T) => {
    get().updateGlobalStoreByKey(key, value)
    setStorageValue('APP_CACHE', {
      themeType: key === 'themeType' ? value : get().themeType || 'default',
      isAdvanceMode: key === 'isAdvanceMode' ? value : get().isAdvanceMode || false,
    })
  },
  updateConnectState: (
    status: ConnectState['status'],
    stage: ConnectState['stage'],
    options?: ConnectState['options']
  ) => {
    const value = options ? { status, stage, options } : { status, stage }
    get().updateGlobalStoreByKey('connectState', value)
  },
  updateCurveJs: async (curveApi: Curve, prevCurveApi: Curve | null, wallet: Wallet | null) => {
    const { gas, loans, usdRates, ...state } = get()

    const isNetworkSwitched = !!prevCurveApi?.chainId && prevCurveApi.chainId !== curveApi.chainId
    const isUserSwitched = !!prevCurveApi?.signerAddress && prevCurveApi.signerAddress !== curveApi.signerAddress
    log('updateCurveJs', curveApi?.chainId, {
      wallet: wallet?.chains[0]?.id ?? '',
      isNetworkSwitched,
      isUserSwitched,
    })

    // reset store
    if (isUserSwitched || !curveApi.signerAddress) {
      loans.setStateByKey('userWalletBalancesMapper', {})
      loans.setStateByKey('userDetailsMapper', {})
    }

    // update network settings from api
    state.updateGlobalStoreByKey('curve', curveApi)
    state.updateGlobalStoreByKey('isLoadingCurve', false)

    // get collateral list
    const { collateralDatas } = await get().collaterals.fetchCollaterals(curveApi)
    await loans.fetchLoansDetails(curveApi, collateralDatas)

    if (!prevCurveApi || isNetworkSwitched) {
      gas.fetchGasInfo(curveApi)
      usdRates.fetchAllStoredUsdRates(curveApi)
      state.fetchCrvUSDTotalSupply(curveApi)
      state.fetchDailyVolume()
    }

    state.updateGlobalStoreByKey('isLoadingApi', false)
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
