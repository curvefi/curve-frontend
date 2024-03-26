import type { GetState, SetState } from 'zustand'
import type { State } from '@/store/useStore'
import type { ConnectState } from '@/ui/utils'
import type { Locale } from '@/lib/i18n'

import isEqual from 'lodash/isEqual'
import produce from 'immer'

import { log } from '@/ui/utils'
import { setStorageValue } from '@/utils'

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
  curve: CurveApi | null
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
  setPageWidth: (pageWidthClassName: PageWidthClassName) => void
  setThemeType: (themeType: Theme) => void
  updateConnectState(status: ConnectState['status'], stage: ConnectState['stage'], options?: ConnectState['options']): void
  updateCurveJs(curveApi: CurveApi, prevCurveApi: CurveApi | null, wallet: Wallet | null): Promise<void>
  updateLayoutHeight: (key: keyof LayoutHeight, value: number | null) => void
  updateShowScrollButton(scrollY: number): void
  updateGlobalStoreByKey: <T>(key: DefaultStateKeys, value: T) => void

  setAppStateByActiveKey<T>(sliceKey: SliceKey, key: StateKey, activeKey: string, value: T, showLog?: boolean): void
  setAppStateByKey<T>(sliceKey: SliceKey, key: StateKey, value: T, showLog?: boolean): void
  setAppStateByKeys<T>(sliceKey: SliceKey, sliceState: Partial<T>, showLog?: boolean): void
  resetAppState<T>(sliceKey: SliceKey, defaultState: T, showLog?: boolean): void
}

const DEFAULT_STATE = {
  connectState: { status: '', stage: '' } as ConnectState,
  curve: null,
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
  themeType: 'default' as const,
}

const createGlobalSlice = (set: SetState<State>, get: GetState<State>): GlobalSlice => ({
  ...DEFAULT_STATE,

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

    log('updateCurveJs', curveApi?.chainId, {
      wallet: wallet?.chains[0]?.id ?? '',
      isNetworkSwitched,
      isUserSwitched,
    })

    // reset store
    if (isNetworkSwitched) {
      get().gas.resetState()
    }

    if (isUserSwitched || !curveApi.signerAddress) {
    }

    get().daoProposals.getProposals(curveApi)

    if (!prevCurveApi || isNetworkSwitched) {
      get().gas.fetchGasInfo(curveApi)
      get().updateGlobalStoreByKey('isLoadingApi', false)

      // pull all api calls before isLoadingApi if it is not needed for initial load
    } else {
      get().updateGlobalStoreByKey('isLoadingApi', false)
    }

    if (curveApi.signerAddress) {
    }
  },
  updateLayoutHeight: (key: keyof LayoutHeight, value: number | null) => {
    set(
      produce((state: State) => {
        if (value !== null) state.layoutHeight[key] = value
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
