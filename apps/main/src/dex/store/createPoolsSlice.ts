import { produce } from 'immer'
import { chunk, countBy } from 'lodash'
import type { StoreApi } from 'zustand'
import { curvejsApi } from '@/dex/lib/curvejs'
import { invalidatePoolCurrencyReserves } from '@/dex/queries/pool-currency-reserves.query'
import type { State } from '@/dex/store/useStore'
import { ChainId, CurveApi, PoolData, PoolDataMapper, RewardsApyMapper } from '@/dex/types/main.types'
import { requireLib } from '@evm-ui/features/connect-wallet'
import { PromisePool } from '@supercharge/promise-pool'
import { log } from '@ui/lib/logging'
import { fetchNetworks } from '../entities/networks'
import { getPools } from '../lib/pools'

type StateKey = keyof typeof DEFAULT_STATE

type SliceState = {
  poolsMapper: Record<string, PoolDataMapper>
  rewardsApyMapper: Record<string, RewardsApyMapper>
  stakedMapper: Record<
    string,
    { totalStakedPercent: number | string; gaugeTotalSupply: number | string; timestamp: number }
  >
  error: string
}

const SLICE_KEY = 'pools'

export type PoolsSlice = {
  [SLICE_KEY]: SliceState & {
    fetchPools: (
      curve: CurveApi,
      poolIds: string[],
      options: { includeGaugeData: boolean },
    ) => Promise<{ poolsMapper: PoolDataMapper; poolDatas: PoolData[] } | undefined>
    fetchNewPool: (curve: CurveApi, poolId: string) => Promise<PoolData | undefined>
    fetchPoolsRewardsApy: (chainId: ChainId, poolDatas: PoolData[], useApi?: boolean) => Promise<void>
    fetchMissingPoolsRewardsApy: (chainId: ChainId, poolDatas: PoolData[]) => Promise<void>
    fetchPoolStats: (curve: CurveApi, poolData: PoolData) => Promise<void>
    setPoolIsWrapped: (poolData: PoolData, isWrapped: boolean) => { tokens: string[]; tokenAddresses: string[] }
    updatePool: (chainId: ChainId, poolId: string, updatedPoolData: Partial<PoolData>) => void
    setEmptyPoolListDefault: (chainId: ChainId) => void

    setStateByActiveKey: <T>(key: StateKey, activeKey: string, value: T) => void
    setStateByKey: <T>(key: StateKey, value: T) => void
    setStateByKeys: (SliceState: Partial<SliceState>) => void
    resetState: () => void
  }
}

const DEFAULT_STATE: SliceState = { poolsMapper: {}, rewardsApyMapper: {}, stakedMapper: {}, error: '' } as const

export const createPoolsSlice = (set: StoreApi<State>['setState'], get: StoreApi<State>['getState']): PoolsSlice => ({
  [SLICE_KEY]: {
    ...DEFAULT_STATE,

    fetchPools: async (curve, poolIds, { includeGaugeData }) => {
      const { pools } = get()
      const { chainId } = curve

      // if no pools found for network, set tvl, volume and pools state to empty object
      if (!poolIds.length) {
        pools.setEmptyPoolListDefault(chainId)
        return
      }

      const networks = await fetchNetworks()

      try {
        set(
          produce((state: State) => {
            state.pools.error = ''
          }),
        )

        const { poolsMapper } = await getPools(curve, poolIds, networks[chainId], includeGaugeData)
        const poolDatas = Object.entries(poolsMapper).map(([_, v]) => v)

        set(
          produce((state: State) => {
            state.pools.poolsMapper[chainId] = poolsMapper
          }),
        )

        return { poolsMapper, poolDatas }
      } catch (error) {
        console.error(error)

        set(
          produce((state: State) => {
            state.pools.error = 'Unable to load pool list, please refresh or try again later.'
          }),
        )
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
      const resp = await get()[SLICE_KEY].fetchPools(curve, [poolId], { includeGaugeData: true })
      const poolData = resp?.poolsMapper?.[poolId]
      return poolData
    },
    fetchPoolsRewardsApy: async (chainId, poolIds, useApi = true) => {
      log('fetchPoolsRewardsApy', chainId, poolIds.length)
      const state = get()
      const { rewardsApyMapper: allRewardsApyMapper, setStateByActiveKey } = state[SLICE_KEY]
      const networks = await fetchNetworks()
      const network = networks[chainId]

      let rewardsApyMapper: RewardsApyMapper = { ...allRewardsApyMapper[chainId] }

      // retrieve data in chunks so that the data can already be displayed in the UI
      for (const part of chunk(poolIds, 200)) {
        const { results } = await PromisePool.for(part).process(({ pool }) =>
          curvejsApi.pool.poolAllRewardsApy(network, pool, useApi),
        )
        rewardsApyMapper = {
          ...rewardsApyMapper,
          ...Object.fromEntries(results.map(rewardsApy => [rewardsApy.poolId, rewardsApy])),
        }
      }

      setStateByActiveKey('rewardsApyMapper', chainId.toString(), rewardsApyMapper)
    },
    // eslint-disable-next-line @typescript-eslint/require-await -- Existing violation before enabling this rule.
    fetchMissingPoolsRewardsApy: async (chainId, poolDatas) => {
      const { rewardsApyMapper: allRewardsApyMapper, fetchPoolsRewardsApy } = get()[SLICE_KEY]
      const rewardsApyMapper = allRewardsApyMapper[chainId] ?? {}
      const missingRewardsPoolIds = poolDatas.filter(({ pool }) => typeof rewardsApyMapper[pool.id] === 'undefined')

      if (missingRewardsPoolIds.length > 0) {
        log('fetchMissingPoolsRewardsApy', chainId, missingRewardsPoolIds.length)
        void fetchPoolsRewardsApy(chainId, missingRewardsPoolIds)
      }

      // const missingRewardsPoolIds = []
      // for (const idx in poolDatas) {
      //   const poolData = poolDatas[idx]
      //   if (!rewardsApyMapper[poolData.pool.id]) {
      //     missingRewardsApyList.push(poolData)
      //   }
      // }
      //
      // if (missingRewardsApyList.length > 0) {
      //   log('fetchMissingPoolsRewardsApy', chainId, missingRewardsApyList.length)
      //   get().pools.fetchPoolsRewardsApy(chainId, missingRewardsApyList)
      // }
    },
    fetchPoolStats: async (curve, poolData) => {
      const { pools } = get()
      const { chainId, signerAddress } = curve
      const { pool } = poolData
      log('fetchPoolStats', chainId, pool.id)
      const useApi = !signerAddress // prefer on-chain data when the wallet is connected

      try {
        await Promise.all([
          invalidatePoolCurrencyReserves({ chainId, poolId: pool.id }),
          pools.fetchPoolsRewardsApy(chainId, [poolData], useApi),
        ])
      } catch (error) {
        console.error(error)
      }
    },
    setPoolIsWrapped: (poolData, isWrapped) => {
      const curve = requireLib('curveApi')
      const chainId = curve.chainId

      const tokens = curvejsApi.pool.poolTokens(poolData.pool, isWrapped)
      const tokenAddresses = curvejsApi.pool.poolTokenAddresses(poolData.pool, isWrapped)
      const cPoolData = { ...poolData, isWrapped, tokens, tokensCountBy: countBy(tokens), tokenAddresses }

      set(
        produce((state: State) => {
          state.pools.poolsMapper[chainId][poolData.pool.id] = cPoolData
        }),
      )
      return { tokens, tokenAddresses }
    },
    updatePool: (chainId, poolId, updatedPoolData) => {
      set(
        produce((state: State) => {
          state.pools.poolsMapper[chainId][poolId] = { ...state.pools.poolsMapper[chainId][poolId], ...updatedPoolData }
        }),
      )
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
      get().resetAppState(SLICE_KEY, {
        ...DEFAULT_STATE,
        poolsMapper: get()[SLICE_KEY].poolsMapper,
        rewardsApyMapper: get()[SLICE_KEY].rewardsApyMapper,
      })
    },
  },
})
