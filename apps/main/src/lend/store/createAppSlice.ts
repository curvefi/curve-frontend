import produce from 'immer'
import isEqual from 'lodash/isEqual'
import type { GetState, SetState } from 'zustand'
import { prefetchMarkets } from '@/lend/entities/chain/chain-query'
import type { State } from '@/lend/store/useStore'
import { LlamalendApi, Wallet } from '@/lend/types/lend.types'
import { CONNECT_STAGE, ConnectState } from '@ui/utils'
import { log } from '@ui-kit/lib/logging'

export type DefaultStateKeys = keyof typeof DEFAULT_STATE
export type SliceKey = keyof State | ''
export type StateKey = string

type SliceState = {
  connectState: ConnectState
  isPageVisible: boolean
  scrollY: number
}

// prettier-ignore
export interface AppSlice extends SliceState {
  updateConnectState(status?: ConnectState['status'], stage?: ConnectState['stage'], options?: ConnectState['options']): void
  updateGlobalStoreByKey<T>(key: DefaultStateKeys, value: T): void

  /** Hydrate resets states and refreshes store data from the API */
  hydrate(api: LlamalendApi, prevApi: LlamalendApi | null, wallet: Wallet | null): Promise<void>

  setAppStateByActiveKey<T>(sliceKey: SliceKey, key: StateKey, activeKey: string, value: T, showLog?: boolean): void
  setAppStateByKey<T>(sliceKey: SliceKey, key: StateKey, value: T, showLog?: boolean): void
  setAppStateByKeys<T>(sliceKey: SliceKey, sliceState: Partial<T>, showLog?: boolean): void
  resetAppState<T>(sliceKey: SliceKey, defaultState: T): void
}

const DEFAULT_STATE: SliceState = {
  connectState: { status: '', stage: '' },
  isPageVisible: true,
  scrollY: 0,
}

const createAppSlice = (set: SetState<State>, get: GetState<State>): AppSlice => ({
  ...DEFAULT_STATE,

  updateConnectState: (status = 'loading', stage = CONNECT_STAGE.CONNECT_WALLET, options = ['']) => {
    set({ connectState: { status, stage, ...(options && { options }) } })
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
    const isUserSwitched = !!prevApi?.signerAddress && prevApi.signerAddress !== api.signerAddress
    const state = get()

    log('Hydrating Lend', api?.chainId, {
      wallet: wallet?.chains[0]?.id ?? '',
      isNetworkSwitched,
      isUserSwitched,
    })

    // reset store
    if (isNetworkSwitched) {
      Object.keys(get()).forEach((stateKey) => {
        if (
          stateKey.startsWith('loan') ||
          stateKey.startsWith('user') ||
          stateKey === 'tokens' ||
          stateKey === 'chartBands' ||
          stateKey === 'campaigns'
        ) {
          // @ts-ignore
          if ('resetState' in get()[stateKey]) get()[stateKey].resetState()
        }
      })
    }

    if (isUserSwitched || !api.signerAddress) {
      state.user.resetState()
    }

    // unfortunately, we cannot use markets from the cache as that leaves curve-llamalend-js in an inconsistent state
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
          if (!isEqual(storedActiveKeyValues, parsedValue)) {
            if (showLog) {
              log(`%c state: ${key}`, 'background: #222; color: #ffff3f', parsedValue)
            }
            state[sliceKey][key] = parsedValue
          }
        } else if (typeof storedValues === 'object') {
          const parsedValue = { ...storedValues, [activeKey]: value }
          if (!isEqual(storedActiveKeyValues, parsedValue)) {
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
        if (!isEqual(storedValue, value)) {
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
          if (!isEqual(storedValue, value)) {
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

export default createAppSlice

// HELPERS
