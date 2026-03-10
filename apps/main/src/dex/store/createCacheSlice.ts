import { StoreApi } from 'zustand'
import type { State } from '@/dex/store/useStore'
import { PoolDataCacheMapper } from '@/dex/types/main.types'
import { sleep } from '@/dex/utils'

export type SwapFormValuesCache = {
  fromAddress: string
  fromToken: string
  toAddress: string
  toToken: string
}

type StateKey = keyof typeof DEFAULT_STATE

type SliceState = {
  hasDepositAndStake: { [chainId: string]: boolean }
  hasRouter: { [chainId: string]: boolean }
  poolsMapper: { [chainId: string]: PoolDataCacheMapper }
  routerFormValues: { [chainId: string]: SwapFormValuesCache }
}

const sliceKey = 'storeCache'

export type CacheSlice = {
  [sliceKey]: SliceState & {
    setStateByActiveKey<T>(key: StateKey, activeKey: string, value: T): Promise<void>
    setStateByKey<T>(key: StateKey, value: T): Promise<void>
    setStateByKeys(SliceState: Partial<SliceState>): Promise<void>
    resetState(): void
  }
}

const DEFAULT_STATE: SliceState = {
  hasDepositAndStake: {},
  hasRouter: {},
  poolsMapper: {},
  routerFormValues: {},
}

const TIMEOUT_MS = 4000

export const createCacheSlice = (_: StoreApi<State>['setState'], get: StoreApi<State>['getState']): CacheSlice => ({
  storeCache: {
    ...DEFAULT_STATE,

    // slice helpers
    setStateByActiveKey: async <T>(key: StateKey, activeKey: string, value: T) => {
      await sleep(TIMEOUT_MS)
      get().setAppStateByActiveKey(sliceKey, key, activeKey, value)
    },
    setStateByKey: async <T>(key: StateKey, value: T) => {
      await sleep(TIMEOUT_MS)
      get().setAppStateByKey(sliceKey, key, value)
    },
    setStateByKeys: async (sliceState: Partial<SliceState>) => {
      await sleep(TIMEOUT_MS)
      get().setAppStateByKeys(sliceKey, sliceState)
    },
    resetState: () => {
      get().resetAppState(sliceKey, DEFAULT_STATE)
    },
  },
})
