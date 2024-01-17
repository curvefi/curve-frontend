import type { GetState, SetState } from 'zustand'
import type { State } from '@/store/useStore'

import { sleep } from '@/utils'

type SwapFormValuesCache = {
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
  rewardsApyMapper: { [chainId: string]: RewardsApyMapper }
  routerFormValues: { [chainId: string]: SwapFormValuesCache }
  routerSelectToList: { [chainId: string]: string[] }
  tokensMapper: { [chainId: string]: TokensMapper }
  tokensNameMapper: { [chainId: string]: { [tokenAddress: string]: string } }
  tvlMapper: { [chainId: string]: TvlMapper }
  tvlTotal: { [chainId: string]: number }
  volumeMapper: { [chainId: string]: VolumeMapper }
  volumeTotal: { [chainId: string]: number }
  volumeCryptoShare: { [chainId: string]: number }
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
  rewardsApyMapper: {},
  routerFormValues: {},
  routerSelectToList: {},
  tokensMapper: {},
  tokensNameMapper: {},
  tvlMapper: {},
  tvlTotal: {},
  volumeMapper: {},
  volumeTotal: {},
  volumeCryptoShare: {},
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
