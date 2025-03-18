import produce from 'immer'
import isEqual from 'lodash/isEqual'
import type { GetState, SetState } from 'zustand'
import type { State } from '@/dao/store/useStore'
import { CurveApi, Wallet } from '@/dao/types/dao.types'
import { CONNECT_STAGE, ConnectState } from '@ui/utils'
import { log } from '@ui-kit/lib'

export type DefaultStateKeys = keyof typeof DEFAULT_STATE
export type SliceKey = keyof State | ''
export type StateKey = string
export type LayoutHeight = {
  globalAlert: number
  mainNav: number
  secondaryNav: number
  footer: number
}

type SliceState = {
  curve: CurveApi | null
  connectState: ConnectState
  isLoadingApi: boolean
  isLoadingCurve: boolean
  isPageVisible: boolean
  layoutHeight: LayoutHeight
  loaded: boolean
  showScrollButton: boolean
}

// prettier-ignore
export interface AppSlice extends SliceState {
  updateConnectState(status?: ConnectState['status'], stage?: ConnectState['stage'], options?: ConnectState['options']): void
  updateCurveJs(curveApi: CurveApi, prevCurveApi: CurveApi | null, wallet: Wallet | null): Promise<void>
  updateLayoutHeight: (key: keyof LayoutHeight, value: number | null) => void
  updateShowScrollButton(scrollY: number): void
  updateGlobalStoreByKey: <T>(key: DefaultStateKeys, value: T) => void

  setAppStateByActiveKey<T>(sliceKey: SliceKey, key: StateKey, activeKey: string, value: T): void
  setAppStateByKey<T>(sliceKey: SliceKey, key: StateKey, value: T): void
  setAppStateByKeys<T>(sliceKey: SliceKey, sliceState: Partial<T>): void
  resetAppState<T>(sliceKey: SliceKey, defaultState: T): void
}

const DEFAULT_STATE = {
  curve: null,
  isLoadingApi: false,
  isLoadingCurve: true,
  isPageVisible: true,
  loaded: false,
  layoutHeight: {
    globalAlert: 0,
    mainNav: 0,
    secondaryNav: 0,
    footer: 0,
  },
  showScrollButton: false,
  connectState: { status: '', stage: '' },
} satisfies SliceState

const createAppSlice = (set: SetState<State>, get: GetState<State>): AppSlice => ({
  ...DEFAULT_STATE,

  updateConnectState: (status = 'loading', stage = CONNECT_STAGE.CONNECT_WALLET, options = ['']) => {
    set({ connectState: { status, stage, ...(options && { options }) } })
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

    // update network settings from api
    get().updateGlobalStoreByKey('curve', curveApi)
    get().updateGlobalStoreByKey('isLoadingCurve', false)

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
      }),
    )
  },
  updateShowScrollButton: (scrollY: number) => {
    const showScrollButton = scrollY > 30
    if (get().showScrollButton !== showScrollButton) {
      set(
        produce((state) => {
          state.showScrollButton = showScrollButton
        }),
      )
    }
  },
  updateGlobalStoreByKey: <T>(key: DefaultStateKeys, value: T) => {
    set(
      produce((state) => {
        state[key] = value
      }),
    )
  },

  setAppStateByActiveKey: <T>(sliceKey: SliceKey, key: StateKey, activeKey: string, value: T) => {
    set(
      produce((state) => {
        const storedValues = state[sliceKey][key]
        const storedActiveKeyValues = storedValues[activeKey]
        if (typeof storedValues === 'undefined') {
          const parsedValue = { [activeKey]: value }
          if (!isEqual(storedActiveKeyValues, parsedValue)) {
            state[sliceKey][key] = parsedValue
          }
        } else if (typeof storedValues === 'object') {
          const parsedValue = { ...storedValues, [activeKey]: value }
          if (!isEqual(storedActiveKeyValues, parsedValue)) {
            state[sliceKey][key] = parsedValue
          }
        }
      }),
    )
  },
  setAppStateByKey: <T>(sliceKey: SliceKey, key: StateKey, value: T) => {
    set(
      produce((state) => {
        const storedValue = state[sliceKey][key]
        if (!isEqual(storedValue, value)) {
          state[sliceKey][key] = value
        }
      }),
    )
  },
  setAppStateByKeys: <T>(sliceKey: SliceKey, sliceState: T) => {
    for (const key in sliceState) {
      const value = sliceState[key]
      set(
        produce((state) => {
          if (!isEqual(state[sliceKey][key], value)) {
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
