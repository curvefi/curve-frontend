import { produce } from 'immer'
import lodash from 'lodash'
import type { Config } from 'wagmi'
import type { StoreApi } from 'zustand'
import type { State } from '@/dao/store/useStore'
import type { CurveApi, Wallet } from '@/dao/types/dao.types'
import { log } from '@ui-kit/lib'

export type SliceKey = keyof State | ''
export type StateKey = string

export interface AppSlice {
  /** Hydrate resets states and refreshes store data from the API */
  hydrate(
    config: Config,
    api: CurveApi | undefined,
    prevApi: CurveApi | undefined,
    wallet: Wallet | undefined,
  ): Promise<void>

  setAppStateByActiveKey<T>(sliceKey: SliceKey, key: StateKey, activeKey: string, value: T): void
  setAppStateByKey<T>(sliceKey: SliceKey, key: StateKey, value: T): void
  setAppStateByKeys<T>(sliceKey: SliceKey, sliceState: Partial<T>): void
  resetAppState<T>(sliceKey: SliceKey, defaultState: T): void
}

export const createAppSlice = (set: StoreApi<State>['setState'], get: StoreApi<State>['getState']): AppSlice => ({
  hydrate: async (_, api, prevApi, wallet) => {
    if (!api) return

    const isNetworkSwitched = prevApi?.chainId != api.chainId

    log('Hydrating DAO', api?.chainId, {
      isNetworkSwitched,
    })

    const { user, gauges } = get()
    await Promise.all([api && wallet?.provider && user.updateUserData(api, wallet), gauges.getGaugesData()])

    log('Hydrating DAO - Complete')
  },

  setAppStateByActiveKey: <T>(sliceKey: SliceKey, key: StateKey, activeKey: string, value: T) => {
    set(
      produce((state) => {
        const storedValues = state[sliceKey][key]
        const storedActiveKeyValues = storedValues[activeKey]
        if (typeof storedValues === 'undefined') {
          const parsedValue = { [activeKey]: value }
          if (!lodash.isEqual(storedActiveKeyValues, parsedValue)) {
            state[sliceKey][key] = parsedValue
          }
        } else if (typeof storedValues === 'object') {
          const parsedValue = { ...storedValues, [activeKey]: value }
          if (!lodash.isEqual(storedActiveKeyValues, parsedValue)) {
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
        if (!lodash.isEqual(storedValue, value)) {
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
          if (!lodash.isEqual(state[sliceKey][key], value)) {
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
