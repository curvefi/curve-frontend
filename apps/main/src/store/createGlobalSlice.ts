import type { GetState, SetState } from 'zustand'
import type { State } from '@/store/useStore'
import type { Locale } from '@/lib/i18n'

import isEqual from 'lodash/isEqual'
import produce from 'immer'

import { log, setStorageValue } from '@/utils'
import { httpFetcher } from '@/lib/utils'
import { initCurveJs } from '@/utils/utilsCurvejs'
import networks from '@/networks'

export type DefaultStateKeys = keyof typeof DEFAULT_STATE
export type SliceKey = keyof State | ''
export type StateKey = string

export type Theme = 'dark' | 'default' | 'chad' | 'commodore'
export type LayoutHeight = {
  globalAlert: number
  mainNav: number
  secondaryNav: number
  footer: number
}

type GlobalState = {
  appNetworkId: ChainId
  curve: CurveApi
  hasDepositAndStake: { [chainId: string]: boolean | null }
  hasRouter: { [chainId: string]: boolean | null }
  isErrorApi: boolean
  isLoadingApi: boolean
  isLoadingCurve: boolean
  isMobile: boolean
  isPageVisible: boolean
  isXXSm: boolean
  isXSmDown: boolean
  isSmUp: boolean
  isMdUp: boolean
  isLgUp: boolean
  isXLgUp: boolean
  layoutHeight: LayoutHeight
  loaded: boolean
  locale: Locale['value']
  pageWidth: PageWidthClassName
  maxSlippage: string
  routerAppNetworkId: ChainId | null
  routerProps: RouterProps | null
  showScrollButton: boolean
  themeType: Theme
}

export interface GlobalSlice extends GlobalState {
  getNetworkConfigFromApi(chainId: ChainId | ''): NetworkConfigFromApi
  setNetworkConfigFromApi(curve: CurveApi): void
  setAppNetworkId: (appNetworkId: ChainId) => void
  setPageWidth: (pageWidthClassName: PageWidthClassName) => void
  setThemeType: (themeType: Theme) => void
  updateAppCache: () => void
  updateCurveJs(appNetworkId: ChainId, wallet: Wallet | null): Promise<void>
  updateLayoutHeight: (key: keyof LayoutHeight, value: number) => void
  updateShowScrollButton(scrollY: number): void
  updateGlobalStoreByKey: <T>(key: DefaultStateKeys, value: T) => void

  setAppStateByActiveKey<T>(sliceKey: SliceKey, key: StateKey, activeKey: string, value: T, showLog?: boolean): void
  setAppStateByKey<T>(sliceKey: SliceKey, key: StateKey, value: T, showLog?: boolean): void
  setAppStateByKeys<T>(sliceKey: SliceKey, sliceState: Partial<T>, showLog?: boolean): void
  resetAppState<T>(sliceKey: SliceKey, defaultState: T, showLog?: boolean): void
}

const DEFAULT_STATE = {
  appNetworkId: null,
  routerAppNetworkId: null,
  curve: null,
  hasDepositAndStake: {},
  hasRouter: {},
  isErrorApi: false,
  isMobile: false,
  isLoadingApi: false,
  isLoadingCurve: true,
  isPageVisible: true,
  isXXSm: false,
  isXSmDown: false,
  isSmUp: false,
  isMdUp: false,
  isLgUp: false,
  isXLgUp: false,
  loaded: false,
  locale: 'en' as const,
  pageWidth: null,
  layoutHeight: {
    globalAlert: 0,
    mainNav: 0,
    secondaryNav: 0,
    footer: 0,
  },
  maxSlippage: '',
  routerProps: null,
  showScrollButton: false,
  themeType: null,
}

const createGlobalSlice = (set: SetState<State>, get: GetState<State>) => ({
  ...DEFAULT_STATE,

  getNetworkConfigFromApi: (chainId: ChainId | '') => {
    let resp: NetworkConfigFromApi = {
      hasDepositAndStake: undefined,
      hasRouter: undefined,
    }
    if (chainId) {
      resp.hasDepositAndStake = get().hasDepositAndStake[chainId] ?? get().storeCache.hasDepositAndStake[chainId]
      resp.hasRouter = get().hasRouter[chainId] ?? get().storeCache.hasRouter[chainId]
    }
    return resp
  },
  setNetworkConfigFromApi: (curve: CurveApi) => {
    const { chainId } = curve
    const { hasDepositAndStake, hasRouter } = networks[chainId].api.network.fetchNetworkConfig(curve)
    set(
      produce((state: State) => {
        state.hasDepositAndStake[chainId] = hasDepositAndStake
        state.storeCache.hasDepositAndStake[chainId] = hasDepositAndStake
        state.hasRouter[chainId] = hasRouter
        state.storeCache.hasRouter[chainId] = hasRouter
      })
    )
  },
  setAppNetworkId: (appNetworkId: ChainId) => {
    set(
      produce((state: State) => {
        state.appNetworkId = appNetworkId
      })
    )
    get().updateAppCache()
  },
  setThemeType: (themeType: Theme) => {
    set(
      produce((state: State) => {
        state.themeType = themeType
      })
    )
    get().updateAppCache()
  },
  setPageWidth: (pageWidthClassName: PageWidthClassName) => {
    const isXLgUp = pageWidthClassName.startsWith('page-wide')
    const isLgUp = pageWidthClassName.startsWith('page-large') || pageWidthClassName.startsWith('page-wide')
    const isMd = pageWidthClassName.startsWith('page-medium')
    const isSmUp = pageWidthClassName === 'page-small'
    const isXSmDown = pageWidthClassName.startsWith('page-small-x')
    const isXXSm = pageWidthClassName === 'page-small-xx'

    set(
      produce((state: State) => {
        state.pageWidth = pageWidthClassName
        state.isXSmDown = isXSmDown
        state.isSmUp = isSmUp || isMd || isLgUp
        state.isMdUp = isMd || isLgUp
        state.isLgUp = isLgUp
        state.isXLgUp = isXLgUp
        state.isXXSm = isXXSm
      })
    )
  },
  updateAppCache: () => {
    setStorageValue('APP_CACHE', {
      appNetworkId: get().appNetworkId || 1,
      themeType: get().themeType || 'default',
    })
  },
  updateCurveJs: async (appNetworkId: ChainId, wallet: Wallet | null) => {
    log('updateCurveJs', appNetworkId, { wallet })

    get().updateGlobalStoreByKey('isErrorApi', false)
    get().updateGlobalStoreByKey('isLoadingCurve', true)
    get().updateGlobalStoreByKey('isLoadingApi', true)
    const { chainId: prevChainId, signerAddress: prevSignerAddress } = get().curve ?? {}
    const isNetworkSwitch = !!prevChainId && prevChainId !== appNetworkId

    // reset store
    if (isNetworkSwitch) {
      get().gas.resetState()
      get().pools.resetState()
      get().quickSwap.resetState()
      get().tokens.resetState()
      get().usdRates.resetState()
      get().userBalances.resetState()
      get().user.resetState()
      get().userBalances.resetState()
      get().lockedCrv.resetState()
      get().createPool.resetState()
    }

    const curveApi = await initCurveJs(appNetworkId, wallet)
    const callAdditionalApis = !prevChainId || isNetworkSwitch

    if (curveApi) {
      get().updateGlobalStoreByKey('curve', curveApi)
      get().updateGlobalStoreByKey('isLoadingCurve', false)
      const chainId = curveApi.chainId

      if (prevSignerAddress !== curveApi?.signerAddress) {
        get().user.resetState()
        get().userBalances.resetState()
      }

      // update network settings from api
      get().setNetworkConfigFromApi(curveApi)

      // get poolList
      const poolIds = await networks[chainId].api.network.fetchAllPoolsList(curveApi)

      // default hideSmallPools to false if poolIds length < 10
      get().poolList.setStateByKey('formValues', { ...get().poolList.formValues, hideSmallPools: poolIds.length > 10 })

      // TODO: Temporary code to determine if there is an issue with getting base APY from  Kava Api (https://api.curve.fi/api/getFactoryAPYs-kava)
      // If `failedFetching24hOldVprice` is true, it means the base apy couldn't be calculated, display in UI
      // something like a dash with a tooltip "not available currently"
      let failedFetching24hOldVprice: { [poolAddress: string]: boolean } = {}
      if (chainId === 2222) {
        try {
          const resp = await httpFetcher('https://api.curve.fi/api/getFactoryAPYs-kava')
          if (resp.success && Object.keys(resp.data.poolDetails).length) {
            for (const poolDetail of resp.data.poolDetails) {
              failedFetching24hOldVprice[poolDetail.poolAddress.toLowerCase()] = poolDetail.failedFetching24hOldVprice
            }
          }
        } catch (error) {
          console.warn('Unable to fetch failedFetching24hOldVprice from https://api.curve.fi/api/getFactoryAPYs-kava')
        }
      }

      await get().pools.fetchPools(
        curveApi,
        [...poolIds, ...Object.keys(networks[chainId].customPoolIds)],
        failedFetching24hOldVprice
      )

      if (callAdditionalApis) {
        get().gas.fetchGasInfo(curveApi)
        get().updateGlobalStoreByKey('isLoadingApi', false)
        get().pools.fetchPricesApiPools(chainId)

        // pull all api calls before isLoadingApi if it is not needed for initial load
        get().usdRates.fetchAllStoredUsdRates(curveApi)
        get().pools.fetchTotalVolumeAndTvl(curveApi)
      } else {
        get().updateGlobalStoreByKey('isLoadingApi', false)
      }

      if (curveApi.signerAddress) {
        get().user.fetchUserPoolList(curveApi)
      }
    }
  },
  updateLayoutHeight: (key: keyof LayoutHeight, value: number) => {
    set(
      produce((state: State) => {
        state.layoutHeight[key] = value
      })
    )
  },
  updateShowScrollButton: (scrollY: number) => {
    const showScrollButton = scrollY > 30
    if (get().showScrollButton !== showScrollButton) {
      set(
        produce((state) => {
          state.showScrollButton = showScrollButton
        })
      )
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
              log(`%c state: ${key}`, 'background: #222; color: #bada55', parsedValue)
            }
            state[sliceKey][key] = parsedValue
          }
        } else if (typeof storedValues === 'object') {
          const parsedValue = { ...storedValues, [activeKey]: value }
          if (!isEqual(storedActiveKeyValues, parsedValue)) {
            if (showLog) {
              log(`%c state: ${key}`, 'background: #222; color: #bada55', parsedValue)
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
            log(`%c state: ${key}`, 'background: #222; color: #bada55', value)
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
              log(`%c state: ${key}`, 'background: #222; color: #bada55', value)
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

export default createGlobalSlice
