import { produce } from 'immer'
import { isEqual } from 'lodash'
import type { Config } from 'wagmi'
import type { StoreApi } from 'zustand'
import type { State } from '@/dex/store/useStore'
import { CurveApi, Wallet } from '@/dex/types/main.types'
import { log } from '@ui/lib/logging'
import { formatTimeDiff } from '@ui/lib/time'
import { fetchPools } from '../lib/curvejs'

export type SliceKey = keyof State | ''
export type StateKey = string

export type GlobalSlice = {
  /** Hydrate resets states and refreshes store data from the API */
  hydrate: (
    config: Config,
    curveApi: CurveApi | undefined,
    prevCurveApi: CurveApi | undefined,
    wallet: Wallet | undefined,
  ) => Promise<void>

  setAppStateByActiveKey: <T>(sliceKey: SliceKey, key: StateKey, activeKey: string, value: T, showLog?: boolean) => void
  setAppStateByKey: <T>(sliceKey: SliceKey, key: StateKey, value: T, showLog?: boolean) => void
  setAppStateByKeys: <T>(sliceKey: SliceKey, sliceState: Partial<T>, showLog?: boolean) => void
  resetAppState: <T>(sliceKey: SliceKey, defaultState: T, showLog?: boolean) => void
}

export const createGlobalSlice = (set: StoreApi<State>['setState'], get: StoreApi<State>['getState']): GlobalSlice => ({
  hydrate: async (_config, curve, prevCurve, _wallet) => {
    if (!curve) return

    const state = get()
    const isNetworkSwitched = prevCurve?.chainId !== curve.chainId
    const isUserSwitched = prevCurve?.signerAddress !== curve.signerAddress
    const start = new Date()
    log('Hydrating DEX', curve?.chainId, { isNetworkSwitched, isUserSwitched, hasRPC: !curve.isNoRPC })

    // reset store
    if (isNetworkSwitched) {
      state.quickSwap.resetState()
      state.createPool.resetState()
      state.dashboard.resetState()
    }

    await fetchPools(curve) // hydrates the lib with pool data required for curve.getPool(poolIdOrAddress)
    log(`Hydrated DEX - Complete in ${formatTimeDiff(start)}`)
  },
  setAppStateByActiveKey: <T>(sliceKey: SliceKey, key: StateKey, activeKey: string, value: T, showLog?: boolean) => {
    set(
      produce(state => {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access -- Existing violation before enabling this rule.
        const storedValues = state[sliceKey][key]
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access -- Existing violation before enabling this rule.
        const storedActiveKeyValues = storedValues[activeKey] // todo: this means the following branch is unreachable?
        if (typeof storedValues === 'undefined') {
          const parsedValue = { [activeKey]: value }
          if (!isEqual(storedActiveKeyValues, parsedValue)) {
            if (showLog) {
              log(`%c state: ${key}`, 'background: #222; color: #bada55', parsedValue)
            }
            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access -- Existing violation before enabling this rule.
            state[sliceKey][key] = parsedValue
          }
        } else if (typeof storedValues === 'object') {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment -- Existing violation before enabling this rule.
          const parsedValue = { ...storedValues, [activeKey]: value }
          if (!isEqual(storedActiveKeyValues, parsedValue)) {
            if (showLog) {
              log(`%c state: ${key}`, 'background: #222; color: #bada55', parsedValue)
            }
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access -- Existing violation before enabling this rule.
            state[sliceKey][key] = parsedValue
          }
        }
      }),
    )
  },
  setAppStateByKey: <T>(sliceKey: SliceKey, key: StateKey, value: T, showLog?: boolean) => {
    set(
      produce(state => {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access -- Existing violation before enabling this rule.
        const storedValue = state[sliceKey][key]
        if (!isEqual(storedValue, value)) {
          if (showLog) {
            log(`%c state: ${key}`, 'background: #222; color: #bada55', value)
          }
          // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access -- Existing violation before enabling this rule.
          state[sliceKey][key] = value
        }
      }),
    )
  },
  setAppStateByKeys: <T>(sliceKey: SliceKey, sliceState: T, showLog?: boolean) => {
    for (const key in sliceState) {
      const value = sliceState[key]
      set(
        produce(state => {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access -- Existing violation before enabling this rule.
          const storedValue = state[sliceKey][key]
          if (!isEqual(storedValue, value)) {
            if (showLog) {
              log(`%c state: ${key}`, 'background: #222; color: #bada55', value)
            }
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
