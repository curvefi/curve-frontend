import { produce } from 'immer'
import { chunk, countBy, isNaN } from 'lodash'
import type { StoreApi } from 'zustand'
import { curvejsApi } from '@/dex/lib/curvejs'
import type { State } from '@/dex/store/useStore'
import {
  ChainId,
  CurrencyReserves,
  CurrencyReservesMapper,
  CurrencyReservesToken,
  CurveApi,
  PoolData,
  PoolDataMapper,
  RewardsApyMapper,
} from '@/dex/types/main.types'
import { getChainPoolIdActiveKey } from '@/dex/utils'
import type { Chain } from '@curvefi/prices-api'
import { requireLib } from '@evm-ui/features/connect-wallet'
import { fetchTokenUsdRate, getTokenUsdRateQueryData } from '@evm-ui/lib/model/entities/token-usd-rate'
import { PromisePool } from '@supercharge/promise-pool'
import { log } from '@ui/lib/logging'
import { fetchNetworks } from '../entities/networks'
import { getPools } from '../lib/pools'
import { invalidatePoolVolumesQuery } from '../queries/pool-volume.query'
import { fetchPoolsBlacklist } from '../queries/pools-blacklist.query'
import { invalidateTokens } from '../queries/tokens.query'

type StateKey = keyof typeof DEFAULT_STATE

type SliceState = {
  poolsMapper: Record<string, PoolDataMapper>
  currencyReserves: CurrencyReservesMapper
  haveAllPools: Record<string, boolean>
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
    fetchPoolCurrenciesReserves: (curve: CurveApi, poolData: PoolData) => Promise<void>
    setPoolIsWrapped: (poolData: PoolData, isWrapped: boolean) => { tokens: string[]; tokenAddresses: string[] }
    updatePool: (chainId: ChainId, poolId: string, updatedPoolData: Partial<PoolData>) => void
    setEmptyPoolListDefault: (chainId: ChainId) => void

    setStateByActiveKey: <T>(key: StateKey, activeKey: string, value: T) => void
    setStateByKey: <T>(key: StateKey, value: T) => void
    setStateByKeys: (SliceState: Partial<SliceState>) => void
    resetState: () => void
  }
}

const DEFAULT_STATE: SliceState = {
  poolsMapper: {},
  haveAllPools: {},
  currencyReserves: {},
  rewardsApyMapper: {},
  stakedMapper: {},
  error: '',
} as const

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
      const { blockchainId } = networks[chainId]

      try {
        set(
          produce((state: State) => {
            state.pools.error = ''
          }),
        )

        const blacklist = await fetchPoolsBlacklist({ blockchainId: blockchainId as Chain })
        const { poolsMapper } = await getPools(curve, poolIds, new Set(blacklist), networks[chainId], includeGaugeData)

        const poolDatas = Object.entries(poolsMapper).map(([_, v]) => v)

        set(
          produce((state: State) => {
            state.pools.poolsMapper[chainId] = poolsMapper
            state.pools.haveAllPools[chainId] = true
          }),
        )

        // New pools mapper means new tokens that need their volumes fetched
        void invalidatePoolVolumesQuery({ chainId })

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
      if (poolData) void invalidateTokens({ chainId: curve.chainId })
      return poolData
    },
    fetchPoolCurrenciesReserves: async (curve, poolData) => {
      const { ...sliceState } = get()[SLICE_KEY]
      const { chainId } = curve
      const { pool, isWrapped, tokens, tokenAddresses } = poolData

      const [balancesResp] = await Promise.all([
        curvejsApi.pool.poolBalances(pool, isWrapped),
        // Fetching the token prices now, used later with getTokenUsdRateQueryData
        ...tokenAddresses.map(tokenAddress => fetchTokenUsdRate({ chainId, tokenAddress }).catch(() => 0)),
      ])

      const { balances } = balancesResp
      const isEmpty = !balances?.length || balances.every(b => +b === 0)
      const crTokens: CurrencyReservesToken[] = []
      let total = 0
      let totalUsd = 0

      for (const [idx, tokenAddress] of tokenAddresses.entries()) {
        const usdRate = getTokenUsdRateQueryData({ chainId, tokenAddress }) ?? 0
        const usdRateError = isNaN(usdRate)
        const balance = Number(balances?.[idx])
        const balanceUsd = !isEmpty && +usdRate > 0 && !usdRateError ? balance * usdRate : 0

        total += balance
        totalUsd += balanceUsd
        const crToken: CurrencyReservesToken = {
          token: tokens[idx],
          tokenAddress,
          balance,
          balanceUsd,
          usdRate,
          percentShareInPool: '',
        }
        // eslint-disable-next-line local/no-mutable-array-methods -- Existing violation before creating this rule.
        crTokens.push(crToken)
      }

      for (const cr of crTokens) {
        if (isEmpty) {
          cr.percentShareInPool = '0'
          // Only use USD balances for currency reserves if all tokens have a usd balance (and pool isn't empty)
        } else if (crTokens.every(cr => cr.balanceUsd)) {
          cr.percentShareInPool = ((cr.balanceUsd / totalUsd) * 100).toFixed(2)
        } else {
          cr.percentShareInPool = ((cr.balance / total) * 100).toFixed(2)
        }
      }

      const result: CurrencyReserves = {
        poolId: pool.id,
        tokens: crTokens,
        total: total.toString(),
        totalUsd: totalUsd.toString(),
      }

      sliceState.setStateByActiveKey('currencyReserves', getChainPoolIdActiveKey(chainId, pool.id), result)
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
          pools.fetchPoolCurrenciesReserves(curve, poolData),
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
      void get().pools.fetchPoolCurrenciesReserves(curve, cPoolData)
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
        currencyReserves: get()[SLICE_KEY].currencyReserves,
        rewardsApyMapper: get()[SLICE_KEY].rewardsApyMapper,
      })
    },
  },
})
