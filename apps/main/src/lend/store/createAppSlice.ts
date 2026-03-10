import { produce } from 'immer'
import lodash from 'lodash'
import type { Config } from 'wagmi'
import { StoreApi } from 'zustand'
import { prefetchMarkets } from '@/lend/entities/chain/chain-query'
import type { State } from '@/lend/store/useStore'
import { Api, Wallet } from '@/lend/types/lend.types'
import { recordEntries } from '@primitives/objects.utils'
import { log } from '@ui-kit/lib/logging'

export type SliceKey = keyof State | ''
export type StateKey = string

// prettier-ignore
export interface AppSlice {
  /** Hydrate resets states and refreshes store data from the API */
  hydrate(config: Config, api: Api | undefined, prevApi: Api | undefined, wallet: Wallet | undefined): Promise<void>

  setAppStateByActiveKey<T>(sliceKey: SliceKey, key: StateKey, activeKey: string, value: T, showLog?: boolean): void
  setAppStateByKey<T>(sliceKey: SliceKey, key: StateKey, value: T, showLog?: boolean): void
  setAppStateByKeys<T>(sliceKey: SliceKey, sliceState: Partial<T>, showLog?: boolean): void
  resetAppState<T>(sliceKey: SliceKey, defaultState: T): void
}

export const createAppSlice = (set: StoreApi<State>['setState'], get: StoreApi<State>['getState']): AppSlice => ({
  hydrate: async (_config, api, prevApi) => {
    if (!api) return

    const isNetworkSwitched = !!prevApi?.chainId && prevApi.chainId !== api.chainId
    const isUserSwitched = !!prevApi?.signerAddress && prevApi.signerAddress !== api.signerAddress
    const state = get()

    log('Hydrating Lend', api.chainId, {
      chainId: [prevApi?.chainId, api.chainId],
      signerAddress: [prevApi?.signerAddress, api.signerAddress],
    })

    // reset store
    if (isNetworkSwitched) {
      recordEntries(get())
        .filter(([stateKey]) => stateKey.startsWith('loan') || stateKey.startsWith('user') || stateKey === 'chartBands')
        .filter(([, state]) => 'resetState' in state)
        .forEach(([, state]) => (state as { resetState: () => void }).resetState())
    }

    if (isUserSwitched || !api.signerAddress) {
      state.user.resetState()
    }

    // unfortunately, we cannot use markets from the cache as that leaves curve-lending-js in an inconsistent state
    await prefetchMarkets({ chainId: api.chainId })

    log('Hydrating Lend - Complete')
  },
  setAppStateByActiveKey: <T>(sliceKey: SliceKey, key: StateKey, activeKey: string, value: T, showLog?: boolean) => {
    set(
      produce((state) => {
        const storedValues = state[sliceKey][key]
        const storedActiveKeyValues = storedValues[activeKey]
        if (typeof storedValues === 'undefined') {
          const parsedValue = { [activeKey]: value }
          if (!lodash.isEqual(storedActiveKeyValues, parsedValue)) {
            if (showLog) {
              log(`%c state: ${key}`, 'background: #222; color: #ffff3f', parsedValue)
            }
            state[sliceKey][key] = parsedValue
          }
        } else if (typeof storedValues === 'object') {
          const parsedValue = { ...storedValues, [activeKey]: value }
          if (!lodash.isEqual(storedActiveKeyValues, parsedValue)) {
            if (showLog) {
              log(`%c state: ${key}`, 'background: #222; color: #ffff3f', parsedValue)
            }
            state[sliceKey][key] = parsedValue
          }
        }
      }),
    )
  },
  setAppStateByKey: <T>(sliceKey: SliceKey, key: StateKey, value: T, showLog?: boolean) => {
    set(
      produce((state) => {
        const storedValue = state[sliceKey][key]
        if (!lodash.isEqual(storedValue, value)) {
          if (showLog) {
            log(`%c state: ${key}`, 'background: #222; color: #d4d700', value)
          }
          state[sliceKey][key] = value
        }
      }),
    )
  },
  setAppStateByKeys: <T>(sliceKey: SliceKey, sliceState: T, showLog?: boolean) => {
    for (const key in sliceState) {
      const value = sliceState[key]
      set(
        produce((state) => {
          const storedValue = state[sliceKey][key]
          if (!lodash.isEqual(storedValue, value)) {
            if (showLog) {
              log(`%c state: ${key}`, 'background: #222; color: #55a630', value)
            }
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
// HELPERS
