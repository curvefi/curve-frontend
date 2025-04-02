import produce from 'immer'
import isEqual from 'lodash/isEqual'
import type { GetState, SetState } from 'zustand'
import type { State } from '@/dao/store/useStore'
import type { CurveApi, Wallet } from '@/dao/types/dao.types'
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
  connectState: ConnectState
  isPageVisible: boolean
  layoutHeight: LayoutHeight
  showScrollButton: boolean
}

// prettier-ignore
export interface AppSlice extends SliceState {
  updateConnectState(status?: ConnectState['status'], stage?: ConnectState['stage'], options?: ConnectState['options']): void
  updateLayoutHeight: (key: keyof LayoutHeight, value: number | null) => void
  updateShowScrollButton(scrollY: number): void
  updateGlobalStoreByKey: <T>(key: DefaultStateKeys, value: T) => void

  /** Hydrate resets states and refreshes store data from the API */
  hydrate(api: CurveApi, prevApi: CurveApi | null, wallet: Wallet | null): void

  setAppStateByActiveKey<T>(sliceKey: SliceKey, key: StateKey, activeKey: string, value: T): void
  setAppStateByKey<T>(sliceKey: SliceKey, key: StateKey, value: T): void
  setAppStateByKeys<T>(sliceKey: SliceKey, sliceState: Partial<T>): void
  resetAppState<T>(sliceKey: SliceKey, defaultState: T): void
}

const DEFAULT_STATE = {
  isPageVisible: true,
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

  hydrate: async (api, prevApi, wallet) => {
    const isNetworkSwitched = !!prevApi?.chainId && prevApi.chainId !== api.chainId

    log('Hydrating DAO', api?.chainId, {
      wallet: wallet?.chains[0]?.id ?? '',
      isNetworkSwitched,
    })

    if (isNetworkSwitched) {
      get().gas.resetState()
    }

    if (!prevApi || isNetworkSwitched) {
      void get().gas.fetchGasInfo(api)
    }

    log('Hydrating DAO - Complete')
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
