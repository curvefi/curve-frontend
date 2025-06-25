import produce from 'immer'
import isEqual from 'lodash/isEqual'
import type { GetState, SetState } from 'zustand'
import type { State } from '@/dao/store/useStore'
import type { CurveApi, Wallet } from '@/dao/types/dao.types'
import { log } from '@ui-kit/lib'

export type DefaultStateKeys = keyof typeof DEFAULT_STATE
export type SliceKey = keyof State | ''
export type StateKey = string
type SliceState = {}

// prettier-ignore
export interface AppSlice extends SliceState {
  updateGlobalStoreByKey: <T>(key: DefaultStateKeys, value: T) => void

  /** Hydrate resets states and refreshes store data from the API */
  hydrate(api: CurveApi | undefined, prevApi: CurveApi | undefined, wallet: Wallet | undefined): Promise<void>

  setAppStateByActiveKey<T>(sliceKey: SliceKey, key: StateKey, activeKey: string, value: T): void
  setAppStateByKey<T>(sliceKey: SliceKey, key: StateKey, value: T): void
  setAppStateByKeys<T>(sliceKey: SliceKey, sliceState: Partial<T>): void
  resetAppState<T>(sliceKey: SliceKey, defaultState: T): void
}

const DEFAULT_STATE = {} satisfies SliceState

const createAppSlice = (set: SetState<State>, get: GetState<State>): AppSlice => ({
  ...DEFAULT_STATE,
  updateGlobalStoreByKey: <T>(key: DefaultStateKeys, value: T) => {
    set(
      produce((state) => {
        state[key] = value
      }),
    )
  },

  hydrate: async (api, prevApi, wallet) => {
    if (!api) return

    const isNetworkSwitched = prevApi?.chainId != api.chainId

    log('Hydrating DAO', api?.chainId, {
      wallet: wallet?.chainId ?? '',
      isNetworkSwitched,
    })

    const { usdRates, user, gas, gauges } = get()
    if (isNetworkSwitched) gas.resetState()
    await Promise.all([
      api && isNetworkSwitched && gas.fetchGasInfo(api),
      api && wallet?.provider && user.updateUserData(api, wallet),
      api && usdRates.fetchAllStoredUsdRates(api),
      gauges.getGauges(),
      gauges.getGaugesData(),
    ])

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
