import type { GetState, SetState } from 'zustand'
import type { State } from '@/dex/store/useStore'
import { ChainId, PoolDataCacheMapper } from '@/dex/types/main.types'
import { sleep } from '@/dex/utils'

export type SwapFormValuesCache = {
  fromAddress: string
  fromToken: string
  toAddress: string
  toToken: string
}

export type ValueMapperCached = { [poolId: string]: { value: string } }

type StateKey = keyof typeof DEFAULT_STATE

type SliceState = {
  hasDepositAndStake: { [chainId: string]: boolean }
  hasRouter: { [chainId: string]: boolean }
  poolsMapper: { [chainId: string]: PoolDataCacheMapper }
  routerFormValues: { [chainId: string]: SwapFormValuesCache }
  tvlMapper: { [chainId: string]: ValueMapperCached }
  volumeMapper: { [chainId: string]: ValueMapperCached }
}

const sliceKey = 'storeCache'

export type CacheSlice = {
  [sliceKey]: SliceState & {
    setTvlVolumeMapper(type: 'tvlMapper' | 'volumeMapper', chainId: ChainId, mapper: ValueMapperCached): void

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
  tvlMapper: {},
  volumeMapper: {},
}

const TIMEOUT_MS = 4000

const createCacheSlice = (set: SetState<State>, get: GetState<State>): CacheSlice => ({
  storeCache: {
    ...DEFAULT_STATE,

    setTvlVolumeMapper: (key, chainId, mapper) => {
      const sliceState = get()[sliceKey]
      const parsedMapper: ValueMapperCached = {}
      const isSmallPoolList = Object.keys(mapper).length < 30

      Object.entries(mapper).forEach(([k, { value }]) => {
        if ((isSmallPoolList && +value > 0) || +value >= 10000) {
          parsedMapper[k] = { value }
        }
      })

      sliceState.setStateByActiveKey(key, chainId.toString(), parsedMapper)
    },

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
