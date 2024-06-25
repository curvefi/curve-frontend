import type { GetState, SetState } from 'zustand'
import type { State } from '@/store/useStore'
import type { Locale } from '@/lib/i18n'
import type { ConnectState, ConnectOptions } from '@/onboard'

import isEqual from 'lodash/isEqual'
import produce from 'immer'

import { CONNECT_STAGE } from '@/onboard'
import { log, setStorageValue } from '@/utils'
import networks from '@/networks'

export type DefaultStateKeys = keyof typeof DEFAULT_STATE
export type SliceKey = keyof State | ''
export type StateKey = string

export type Theme = 'dark' | 'default' | 'chad'
export type LayoutHeight = {
  globalAlert: number
  mainNav: number
  secondaryNav: number
  footer: number
}

type GlobalState = {
  connectState: ConnectState
  curve: CurveApi
  hasDepositAndStake: { [chainId: string]: boolean | null }
  hasRouter: { [chainId: string]: boolean | null }
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
  pageWidth: PageWidthClassName | null
  maxSlippage: string
  routerProps: RouterProps | null
  showScrollButton: boolean
  themeType: Theme
}

// prettier-ignore
export interface GlobalSlice extends GlobalState {
  getNetworkConfigFromApi(chainId: ChainId | ''): NetworkConfigFromApi
  setNetworkConfigFromApi(curve: CurveApi): void
  setPageWidth: (pageWidthClassName: PageWidthClassName) => void
  setThemeType: (themeType: Theme) => void
  updateConnectState<S extends CONNECT_STAGE>(status: ConnectState['status'], stage: S | '', options?: ConnectOptions[S]): void
  updateCurveJs(curveApi: CurveApi, prevCurveApi: CurveApi | null, wallet: Wallet | null): Promise<void>
  updateLayoutHeight: (key: keyof LayoutHeight, value: number) => void
  updateShowScrollButton(scrollY: number): void
  updateGlobalStoreByKey: <T>(key: DefaultStateKeys, value: T) => void

  setAppStateByActiveKey<T>(sliceKey: SliceKey, key: StateKey, activeKey: string, value: T, showLog?: boolean): void
  setAppStateByKey<T>(sliceKey: SliceKey, key: StateKey, value: T, showLog?: boolean): void
  setAppStateByKeys<T>(sliceKey: SliceKey, sliceState: Partial<T>, showLog?: boolean): void
  resetAppState<T>(sliceKey: SliceKey, defaultState: T, showLog?: boolean): void
}

const DEFAULT_STATE = {
  connectState: { status: '', stage: '' },
  curve: null,
  hasDepositAndStake: {},
  hasRouter: {},
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
  themeType: 'default',
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
  setThemeType: (themeType: Theme) => {
    set(
      produce((state: State) => {
        state.themeType = themeType
      })
    )
    setStorageValue('APP_CACHE', { themeType })
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
  updateConnectState: (
    status: ConnectState['status'],
    stage: ConnectState['stage'],
    options?: ConnectState['options']
  ) => {
    const value = options ? { status, stage, options } : { status, stage }
    get().updateGlobalStoreByKey('connectState', value)
  },
  updateCurveJs: async (curveApi: CurveApi, prevCurveApi: CurveApi | null, wallet: Wallet | null) => {
    const isNetworkSwitched = !!prevCurveApi?.chainId && prevCurveApi.chainId !== curveApi.chainId
    const isUserSwitched = !!prevCurveApi?.signerAddress && prevCurveApi.signerAddress !== curveApi.signerAddress
    const { chainId } = curveApi
    log('updateCurveJs', curveApi?.chainId, {
      wallet: wallet?.chains[0]?.id ?? '',
      isNetworkSwitched,
      isUserSwitched,
    })

    // reset store
    if (isNetworkSwitched) {
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

    if (isUserSwitched || !curveApi.signerAddress) {
      get().user.resetState()
      get().userBalances.resetState()
    }

    // update network settings from api
    get().setNetworkConfigFromApi(curveApi)
    get().updateGlobalStoreByKey('curve', curveApi)
    get().updateGlobalStoreByKey('isLoadingCurve', false)

    // get poolList
    const poolIds = await networks[chainId].api.network.fetchAllPoolsList(curveApi)

    // default hideSmallPools to false if poolIds length < 10
    get().poolList.setStateByKey('formValues', { ...get().poolList.formValues, hideSmallPools: poolIds.length > 10 })

    // TODO: Temporary code to determine if there is an issue with getting base APY from  Kava Api (https://api.curve.fi/api/getFactoryAPYs-kava)
    const failedFetching24hOldVprice: { [poolAddress: string]: boolean } =
      chainId === 2222 ? await networks[chainId].api.network.getFailedFetching24hOldVprice() : {}

    await get().pools.fetchPools(
      curveApi,
      poolIds.filter((poolId) => !networks[chainId].customPoolIds[poolId]),
      failedFetching24hOldVprice
    )

    if (!prevCurveApi || isNetworkSwitched) {
      get().gas.fetchGasInfo(curveApi)
      get().updateGlobalStoreByKey('isLoadingApi', false)
      get().pools.fetchPricesApiPools(chainId)
      get().pools.fetchBasePools(curveApi)

      // pull all api calls before isLoadingApi if it is not needed for initial load
      get().usdRates.fetchAllStoredUsdRates(curveApi)
      get().pools.fetchTotalVolumeAndTvl(curveApi)
    } else {
      get().updateGlobalStoreByKey('isLoadingApi', false)
    }

    if (curveApi.signerAddress) {
      get().user.fetchUserPoolList(curveApi)
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
