import { produce } from 'immer'
import { countBy } from 'lodash'
import type { StoreApi } from 'zustand'
import type { State } from '@/dex/store/useStore'
import { ChainId, CurveApi, PoolData, PoolDataMapper, type NetworkConfig, type Pool } from '@/dex/types/main.types'
import { requireLib } from '@evm-ui/features/connect-wallet'
import { shortenAddress } from '@evm-ui/utils'
import { fetchNetworks } from '../entities/networks'

type StateKey = keyof typeof DEFAULT_STATE

type SliceState = {
  poolsMapper: Record<string, PoolDataMapper>
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
    ) => Promise<{ poolsMapper: PoolDataMapper; poolDatas: PoolData[] } | undefined>
    fetchNewPool: (curve: CurveApi, poolId: string) => Promise<PoolData | undefined>
    setPoolIsWrapped: (poolData: PoolData, isWrapped: boolean) => { tokens: string[]; tokenAddresses: string[] }
    updatePool: (chainId: ChainId, poolId: string, updatedPoolData: Partial<PoolData>) => void
    setEmptyPoolListDefault: (chainId: ChainId) => void

    setStateByActiveKey: <T>(key: StateKey, activeKey: string, value: T) => void
    setStateByKey: <T>(key: StateKey, value: T) => void
    setStateByKeys: (SliceState: Partial<SliceState>) => void
    resetState: () => void
  }
}

const DEFAULT_STATE: SliceState = { poolsMapper: {}, stakedMapper: {}, error: '' } as const

const getPoolData = (p: Pool, network: NetworkConfig) => {
  const isWrappedOnly = network.poolIsWrappedOnly[p.id]
  const tokensWrapped = p.wrappedCoins.map((token, idx) => token || shortenAddress(p.wrappedCoinAddresses[idx]))
  const tokens = isWrappedOnly
    ? tokensWrapped
    : p.underlyingCoins.map((token, idx) => token || shortenAddress(p.underlyingCoinAddresses[idx]))
  const tokenAddresses = isWrappedOnly ? p.wrappedCoinAddresses : p.underlyingCoinAddresses
  const tokenAddressesAll = isWrappedOnly
    ? p.wrappedCoinAddresses
    : [...p.underlyingCoinAddresses, ...p.wrappedCoinAddresses]
  const tokensCountBy = countBy(tokens)

  const poolData: PoolData = {
    pool: p,

    // stats
    hasVyperVulnerability: p.hasVyperVulnerability(),
    hasWrapped: isWrappedOnly ?? !(p?.isPlain || p?.isFake),
    isWrapped: isWrappedOnly ?? false,
    tokenAddressesAll,
    tokenAddresses,
    tokens,
    tokensCountBy,
  }

  return poolData
}

export const createPoolsSlice = (set: StoreApi<State>['setState'], get: StoreApi<State>['getState']): PoolsSlice => ({
  [SLICE_KEY]: {
    ...DEFAULT_STATE,

    fetchPools: async (curve, poolIds) => {
      const { pools } = get()
      const { chainId, getPool } = curve

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

        const { poolsMapper } = poolIds.reduce(
          (prev, poolId): { poolsMapper: Record<string, PoolData> } => {
            prev.poolsMapper[poolId] = getPoolData(getPool(poolId), networks[chainId])
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
      const resp = await get()[SLICE_KEY].fetchPools(curve, [poolId])
      const poolData = resp?.poolsMapper?.[poolId]
      return poolData
    },
    setPoolIsWrapped: (poolData, isWrapped) => {
      const curve = requireLib('curveApi')
      const chainId = curve.chainId

      const tokens = isWrapped ? poolData.pool.wrappedCoins : poolData.pool.underlyingCoins
      const tokenAddresses = isWrapped ? poolData.pool.wrappedCoinAddresses : poolData.pool.underlyingCoinAddresses
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
      get().resetAppState(SLICE_KEY, { ...DEFAULT_STATE, poolsMapper: get()[SLICE_KEY].poolsMapper })
    },
  },
})
