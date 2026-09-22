import { produce } from 'immer'
import type { StoreApi } from 'zustand'
import type { State } from '@/dex/store/useStore'
import { ChainId, CurveApi, PoolData, PoolDataMapper } from '@/dex/types/main.types'

type StateKey = keyof typeof DEFAULT_STATE

type SliceState = { poolsMapper: Record<string, PoolDataMapper> }

const SLICE_KEY = 'pools'

export type PoolsSlice = {
  [SLICE_KEY]: SliceState & {
    fetchPools: (
      curve: CurveApi,
      poolIds: string[],
    ) => { poolsMapper: PoolDataMapper; poolDatas: PoolData[] } | undefined
    fetchNewPool: (curve: CurveApi, poolId: string) => Promise<PoolData | undefined>
    setEmptyPoolListDefault: (chainId: ChainId) => void

    setStateByActiveKey: <T>(key: StateKey, activeKey: string, value: T) => void
    setStateByKey: <T>(key: StateKey, value: T) => void
    setStateByKeys: (SliceState: Partial<SliceState>) => void
    resetState: () => void
  }
}

const DEFAULT_STATE: SliceState = { poolsMapper: {} } as const

export const createPoolsSlice = (set: StoreApi<State>['setState'], get: StoreApi<State>['getState']): PoolsSlice => ({
  [SLICE_KEY]: {
    ...DEFAULT_STATE,

    fetchPools: (curve, poolIds) => {
      const { pools } = get()
      const { chainId, getPool } = curve

      // if no pools found for network, set tvl, volume and pools state to empty object
      if (!poolIds.length) {
        pools.setEmptyPoolListDefault(chainId)
        return
      }

      try {
        const { poolsMapper } = poolIds.reduce(
          (prev, poolId): { poolsMapper: Record<string, PoolData> } => {
            const pool = getPool(poolId)
            prev.poolsMapper[poolId] = { pool }
            return prev
          },
          { poolsMapper: {} },
        )
        const poolDatas = Object.entries(poolsMapper).map(([_, v]) => v)

        set(
          produce((state: State) => {
            state.pools.poolsMapper[chainId] = poolsMapper
          }),
        )

        return { poolsMapper, poolDatas }
      } catch (error) {
        console.error(error)
      }
    },
    fetchNewPool: async (curve, poolId) => {
      await Promise.allSettled([
        curve.factory.fetchNewPools(),
        curve.cryptoFactory.fetchNewPools(),
        curve.twocryptoFactory.fetchNewPools(),
        curve.tricryptoFactory.fetchNewPools(),
        curve.stableNgFactory.fetchNewPools(),
      ])
      const resp = get()[SLICE_KEY].fetchPools(curve, [poolId])
      const poolData = resp?.poolsMapper?.[poolId]
      return poolData
    },
    setEmptyPoolListDefault: (chainId: number) => {
      const sliceState = get().pools
      const strChainId = chainId.toString()

      sliceState.setStateByActiveKey('poolsMapper', strChainId, {})
    },

    // slice helpers
    setStateByActiveKey: <T>(key: StateKey, activeKey: string, value: T) => {
      get().setAppStateByActiveKey(SLICE_KEY, key, activeKey, value)
    },
    setStateByKey: <T>(key: StateKey, value: T) => {
      get().setAppStateByKey(SLICE_KEY, key, value)
    },
    setStateByKeys: (sliceState: Partial<SliceState>) => {
      get().setAppStateByKeys(SLICE_KEY, sliceState)
    },
    resetState: () => {
      get().resetAppState(SLICE_KEY, { ...DEFAULT_STATE, poolsMapper: get()[SLICE_KEY].poolsMapper })
    },
  },
})
