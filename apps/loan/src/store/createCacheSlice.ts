import type { GetState, SetState } from 'zustand'
import type { State } from '@loan/store/useStore'

import { sleep } from '@loan/utils/helpers'
import { CollateralDataCacheMapper } from '@loan/types/loan.types'

type StateKey = keyof typeof DEFAULT_STATE

type SliceState = {
  collateralDatasMapper: { [chainId: string]: CollateralDataCacheMapper }
  collateralList: { [activeKey: string]: string[] }
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
  collateralDatasMapper: {},
  collateralList: {},
}

const TIMEOUT_MS = 4000

const createCacheSlice = (set: SetState<State>, get: GetState<State>) => ({
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
    setStateByKeys: async <T>(sliceState: Partial<SliceState>) => {
      await sleep(TIMEOUT_MS)
      get().setAppStateByKeys(sliceKey, sliceState)
    },
    resetState: () => {
      get().resetAppState(sliceKey, DEFAULT_STATE)
    },
  },
})

export default createCacheSlice
