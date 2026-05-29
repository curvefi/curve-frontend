import { produce } from 'immer'
import lodash from 'lodash'
import type { StoreApi } from 'zustand'
import type { State } from '@/dao/store/useStore'

export type SliceKey = keyof State | ''
export type StateKey = string

export interface AppSlice {
  setAppStateByActiveKey<T>(sliceKey: SliceKey, key: StateKey, activeKey: string, value: T): void
  setAppStateByKey<T>(sliceKey: SliceKey, key: StateKey, value: T): void
  setAppStateByKeys<T>(sliceKey: SliceKey, sliceState: Partial<T>): void
  resetAppState<T>(sliceKey: SliceKey, defaultState: T): void
}

export const createAppSlice = (set: StoreApi<State>['setState'], _get: StoreApi<State>['getState']): AppSlice => ({
  setAppStateByActiveKey: <T>(sliceKey: SliceKey, key: StateKey, activeKey: string, value: T) => {
    set(
      produce(state => {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access -- Existing violation before enabling this rule.
        const storedValues = state[sliceKey][key]
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access -- Existing violation before enabling this rule.
        const storedActiveKeyValues = storedValues[activeKey]
        if (typeof storedValues === 'undefined') {
          const parsedValue = { [activeKey]: value }
          if (!lodash.isEqual(storedActiveKeyValues, parsedValue)) {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access -- Existing violation before enabling this rule.
            state[sliceKey][key] = parsedValue
          }
        } else if (typeof storedValues === 'object') {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment -- Existing violation before enabling this rule.
          const parsedValue = { ...storedValues, [activeKey]: value }
          if (!lodash.isEqual(storedActiveKeyValues, parsedValue)) {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access -- Existing violation before enabling this rule.
            state[sliceKey][key] = parsedValue
          }
        }
      }),
    )
  },
  setAppStateByKey: <T>(sliceKey: SliceKey, key: StateKey, value: T) => {
    set(
      produce(state => {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access -- Existing violation before enabling this rule.
        const storedValue = state[sliceKey][key]
        if (!lodash.isEqual(storedValue, value)) {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access -- Existing violation before enabling this rule.
          state[sliceKey][key] = value
        }
      }),
    )
  },
  setAppStateByKeys: <T>(sliceKey: SliceKey, sliceState: T) => {
    for (const key in sliceState) {
      const value = sliceState[key]
      set(
        produce(state => {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access -- Existing violation before enabling this rule.
          if (!lodash.isEqual(state[sliceKey][key], value)) {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access -- Existing violation before enabling this rule.
            state[sliceKey][key] = value
          }
        }),
      )
    }
  },
  resetAppState: <T>(sliceKey: SliceKey, defaultState: T) => {
    set(
      produce(state => {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access -- Existing violation before enabling this rule.
        state[sliceKey] = { ...state[sliceKey], ...defaultState }
      }),
    )
  },
})
