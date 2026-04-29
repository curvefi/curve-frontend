import { produce } from 'immer'
import type { UTCTimestamp } from 'lightweight-charts'
import lodash from 'lodash'
import { zeroAddress } from 'viem'
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
  TokensMapper,
} from '@/dex/types/main.types'
import { getChainPoolIdActiveKey } from '@/dex/utils'
import type { Chain } from '@curvefi/prices-api'
import { PromisePool } from '@supercharge/promise-pool'
import type {
  ChartSelection,
  FetchingStatus,
  LpPriceApiResponse,
  LpPriceOhlcDataFormatted,
} from '@ui-kit/features/candle-chart/types'
import { convertToLocaleTimestamp } from '@ui-kit/features/candle-chart/utils'
import { requireLib } from '@ui-kit/features/connect-wallet'
import { log } from '@ui-kit/lib/logging'
import { fetchTokenUsdRate, getTokenUsdRateQueryData } from '@ui-kit/lib/model/entities/token-usd-rate'
import { Chain as ChainEnum } from '@ui-kit/utils'
import { fetchNetworks } from '../entities/networks'
import { getPools } from '../lib/pools'
import { fetchPoolsBlacklist } from '../queries/pools-blacklist.query'

type StateKey = keyof typeof DEFAULT_STATE
const { chunk, countBy, groupBy, isNaN } = lodash

type SliceState = {
  poolsMapper: { [chainId: string]: PoolDataMapper }
  currencyReserves: CurrencyReservesMapper
  haveAllPools: { [chainId: string]: boolean }
  rewardsApyMapper: { [chainId: string]: RewardsApyMapper }
  stakedMapper: {
    [poolAddress: string]: { totalStakedPercent: number | string; gaugeTotalSupply: number | string; timestamp: number }
  }
  pricesApiState: {
    chartOhlcData: LpPriceOhlcDataFormatted[]
    chartStatus: FetchingStatus
    refetchingCapped: boolean
    lastFetchEndTime: number
  }
  error: string
}

const sliceKey = 'pools'

export type PoolsSlice = {
  [sliceKey]: SliceState & {
    fetchPools(
      curve: CurveApi,
      poolIds: string[],
    ): Promise<{ poolsMapper: PoolDataMapper; poolDatas: PoolData[] } | undefined>
    fetchNewPool(curve: CurveApi, poolId: string): Promise<PoolData | undefined>
    fetchPoolsRewardsApy(chainId: ChainId, poolDatas: PoolData[]): Promise<void>
    fetchMissingPoolsRewardsApy(chainId: ChainId, poolDatas: PoolData[]): Promise<void>
    fetchPoolStats: (curve: CurveApi, poolData: PoolData) => Promise<void>
    fetchPoolCurrenciesReserves(curve: CurveApi, poolData: PoolData): Promise<void>
    setPoolIsWrapped(poolData: PoolData, isWrapped: boolean): { tokens: string[]; tokenAddresses: string[] }
    updatePool: (chainId: ChainId, poolId: string, updatedPoolData: Partial<PoolData>) => void
    fetchPricesApiCharts: (
      chainId: ChainId,
      chartSelection: ChartSelection,
      poolAddress: string,
      interval: number,
      timeUnit: string,
      start: number,
      end: number,
    ) => void
    fetchMorePricesApiCharts: (
      chainId: ChainId,
      chartSelection: ChartSelection,
      poolAddress: string,
      interval: number,
      timeUnit: string,
      start: number,
      end: number,
    ) => void
    setEmptyPoolListDefault(chainId: ChainId): void

    setStateByActiveKey<T>(key: StateKey, activeKey: string, value: T): void
    setStateByKey<T>(key: StateKey, value: T): void
    setStateByKeys(SliceState: Partial<SliceState>): void
    resetState(): void
  }
}

const DEFAULT_STATE: SliceState = {
  poolsMapper: {},
  haveAllPools: {},
  currencyReserves: {},
  rewardsApyMapper: {},
  stakedMapper: {},
  pricesApiState: {
    chartOhlcData: [],
    chartStatus: 'LOADING',
    refetchingCapped: false,
    lastFetchEndTime: 0,
  },
  error: '',
} as const

export const createPoolsSlice = (set: StoreApi<State>['setState'], get: StoreApi<State>['getState']): PoolsSlice => ({
  [sliceKey]: {
    ...DEFAULT_STATE,

    fetchPools: async (curve, poolIds) => {
      const { pools, storeCache, tokens } = get()
      const { chainId } = curve

      // if no pools found for network, set tvl, volume and pools state to empty object
      if (!poolIds.length) {
        pools.setEmptyPoolListDefault(chainId)
        tokens.setEmptyPoolListDefault(curve)
        return
      }

      // TODO: Temporary code to determine if there is an issue with getting base APY from  Kava Api (https://api.curve.finance/api/getFactoryAPYs-kava)
      const failedFetching24hOldVprice: { [poolAddress: string]: boolean } =
        chainId === ChainEnum.Kava ? await curvejsApi.network.getFailedFetching24hOldVprice() : {}

      const networks = await fetchNetworks()
      const { id } = networks[chainId]
      const nativeToken = curve.getNetworkConstants().NATIVE_TOKEN

      try {
        set(
          produce((state: State) => {
            state.pools.error = ''
          }),
        )

        const blacklist = await fetchPoolsBlacklist({ blockchainId: id as Chain })
        const { poolsMapper, poolsMapperCache } = await getPools(
          curve,
          poolIds,
          new Set(blacklist),
          networks[chainId],
          failedFetching24hOldVprice,
        )

        const poolDatas = Object.entries(poolsMapper).map(([_, v]) => v)

        set(
          produce((state: State) => {
            state.pools.poolsMapper[chainId] = poolsMapper
            state.tokens.tokensNameMapper[chainId] = {
              ...(nativeToken && {
                [nativeToken.address]: nativeToken.symbol,
                [nativeToken.wrappedAddress]: nativeToken.wrappedSymbol,
              }),
              ...parsedTokensNameMapper(poolDatas),
            }
            state.pools.haveAllPools[chainId] = true
          }),
        )

        // update cache
        void storeCache.setStateByActiveKey('poolsMapper', chainId.toString(), poolsMapperCache)

        const partialPoolDatas = Object.keys(poolsMapper).map(poolId => poolsMapper[poolId])

        if (!partialPoolDatas.length) return { poolsMapper, poolDatas: partialPoolDatas }

        // fetch tokens
        await tokens.setTokensMapper(curve, partialPoolDatas)

        return { poolsMapper, poolDatas: partialPoolDatas }
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
      const resp = await get()[sliceKey].fetchPools(curve, [poolId])
      return resp?.poolsMapper?.[poolId]
    },
    fetchPoolCurrenciesReserves: async (curve, poolData) => {
      const { ...sliceState } = get()[sliceKey]
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
    fetchPoolsRewardsApy: async (chainId, poolIds) => {
      const state = get()
      const { rewardsApyMapper: allRewardsApyMapper, setStateByActiveKey } = state[sliceKey]
      const networks = await fetchNetworks()
      const network = networks[chainId]
      const { poolAllRewardsApy } = curvejsApi.pool

      log('fetchPoolsRewardsApy', chainId, poolIds.length)
      let rewardsApyMapper: RewardsApyMapper = { ...allRewardsApyMapper[chainId] }

      // retrieve data in chunks so that the data can already be displayed in the UI
      for (const part of chunk(poolIds, 200)) {
        const { results } = await PromisePool.for(part).process(poolData => poolAllRewardsApy(network, poolData.pool))
        rewardsApyMapper = {
          ...rewardsApyMapper,
          ...Object.fromEntries(results.map(rewardsApy => [rewardsApy.poolId, rewardsApy])),
        }
      }

      setStateByActiveKey('rewardsApyMapper', chainId.toString(), rewardsApyMapper)
    },
    fetchMissingPoolsRewardsApy: async (chainId, poolDatas) => {
      const { rewardsApyMapper: allRewardsApyMapper, fetchPoolsRewardsApy } = get()[sliceKey]
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
      const { chainId } = curve
      const { pool } = poolData
      log('fetchPoolStats', chainId, pool.id)

      try {
        await Promise.all([
          pools.fetchPoolCurrenciesReserves(curve, poolData),
          pools.fetchPoolsRewardsApy(chainId, [poolData]),
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
      const cPoolData = {
        ...poolData,
        isWrapped,
        tokens,
        tokensCountBy: countBy(tokens),
        tokenAddresses,
      }

      set(
        produce(state => {
          state.pools.poolsMapper[chainId][poolData.pool.id] = cPoolData
        }),
      )
      void get().pools.fetchPoolCurrenciesReserves(curve, cPoolData)
      return { tokens, tokenAddresses }
    },
    updatePool: (chainId, poolId, updatedPoolData) => {
      set(
        produce(state => {
          state.pools.poolsMapper[chainId][poolId] = updatedPoolData
        }),
      )
    },
    fetchPricesApiCharts: async (
      chainId: ChainId,
      chartSelection: ChartSelection,
      poolAddress: string,
      interval: number,
      timeUnit: string,
      end: number,
      start: number,
    ) => {
      set(
        produce((state: State) => {
          state.pools.pricesApiState.chartStatus = 'LOADING'
          state.pools.pricesApiState.refetchingCapped = DEFAULT_STATE.pricesApiState.refetchingCapped
        }),
      )

      const networks = await fetchNetworks()
      const network = networks[chainId].id.toLowerCase()
      const baseParams = `agg_number=${interval}&agg_units=${timeUnit}&start=${start}&end=${end}`

      // TODO: refactor getOHLC from prices-api to the extra needs of /dex pools and use it here
      const url =
        chartSelection.type === 'pair'
          ? `https://prices.curve.finance/v1/ohlc/${network}/${poolAddress}?main_token=${chartSelection.mainToken.address}&reference_token=${chartSelection.refToken.address}&${baseParams}`
          : `https://prices.curve.finance/v1/lp_ohlc/${network}/${poolAddress}?${baseParams}&price_units=${chartSelection.type === 'lp-usd' ? 'usd' : 'token0'}`

      try {
        const response = await fetch(url)
        const responseData: LpPriceApiResponse = await response.json()
        const filteredData = responseData.data
          .filter(item => item.open !== null && item.close !== null && item.high !== null && item.low !== null)
          .map(item => ({ ...item, time: convertToLocaleTimestamp(item.time) as UTCTimestamp }))

        set(
          produce((state: State) => {
            state.pools.pricesApiState.chartOhlcData = filteredData
            state.pools.pricesApiState.refetchingCapped = filteredData.length < 298
            state.pools.pricesApiState.lastFetchEndTime = responseData.data[0]?.time ?? 0
            state.pools.pricesApiState.chartStatus = 'READY'
          }),
        )
      } catch (error) {
        set(
          produce((state: State) => {
            state.pools.pricesApiState.chartStatus = 'ERROR'
          }),
        )
        console.warn(error)
      }
    },
    fetchMorePricesApiCharts: async (
      chainId: ChainId,
      chartSelection: ChartSelection,
      poolAddress: string,
      interval: number,
      timeUnit: string,
      start: number,
      end: number,
    ) => {
      const networks = await fetchNetworks()
      const network = networks[chainId].id.toLowerCase()
      const baseParams = `agg_number=${interval}&agg_units=${timeUnit}&start=${start}&end=${end}`

      const url =
        chartSelection.type === 'pair'
          ? `https://prices.curve.finance/v1/ohlc/${network}/${poolAddress}?main_token=${chartSelection.mainToken.address}&reference_token=${chartSelection.refToken.address}&${baseParams}`
          : `https://prices.curve.finance/v1/lp_ohlc/${network}/${poolAddress}?${baseParams}&price_units=${chartSelection.type === 'lp-usd' ? 'usd' : 'token0'}`

      try {
        const response = await fetch(url)
        const responseData: LpPriceApiResponse = await response.json()
        const filteredData = responseData.data
          .filter(item => item.open !== null && item.close !== null && item.high !== null && item.low !== null)
          .map(item => ({ ...item, time: convertToLocaleTimestamp(item.time) as UTCTimestamp }))

        const updatedData = [...filteredData, ...get().pools.pricesApiState.chartOhlcData]

        set(
          produce((state: State) => {
            state.pools.pricesApiState.chartOhlcData = updatedData
            state.pools.pricesApiState.refetchingCapped = filteredData.length < 299
            state.pools.pricesApiState.lastFetchEndTime = responseData.data[0]?.time ?? 0
          }),
        )
      } catch (error) {
        set(
          produce((state: State) => {
            state.pools.pricesApiState.chartStatus = 'ERROR'
          }),
        )
        console.warn(error)
      }
    },
    setEmptyPoolListDefault: (chainId: number) => {
      const sliceState = get().pools
      const strChainId = chainId.toString()

      sliceState.setStateByActiveKey('poolsMapper', strChainId, {})
    },

    // slice helpers
    setStateByActiveKey: <T>(key: StateKey, activeKey: string, value: T) => {
      get().setAppStateByActiveKey(sliceKey, key, activeKey, value)
    },
    setStateByKey: <T>(key: StateKey, value: T) => {
      get().setAppStateByKey(sliceKey, key, value)
    },
    setStateByKeys: (sliceState: Partial<SliceState>) => {
      get().setAppStateByKeys(sliceKey, sliceState)
    },
    resetState: () => {
      get().resetAppState(sliceKey, {
        ...DEFAULT_STATE,
        poolsMapper: get()[sliceKey].poolsMapper,
        currencyReserves: get()[sliceKey].currencyReserves,
        rewardsApyMapper: get()[sliceKey].rewardsApyMapper,
      })
    },
  },
})
// check for duplicate token name
export function updateHaveSameTokenNames(tokensMapper: TokensMapper) {
  const grouped = groupBy(tokensMapper, v => v!.symbol)
  const duplicatedTokenNames = Object.entries(grouped)
    .filter(([_, v]) => v.length > 1)
    .map(v => v[0])

  if (duplicatedTokenNames.length === 0) return tokensMapper

  return Object.keys(tokensMapper).reduce((prev, key) => {
    const tokenObj = tokensMapper[key]
    if (!tokenObj) return prev

    prev[key] = { ...tokenObj, haveSameTokenName: duplicatedTokenNames.indexOf(tokenObj.symbol) !== -1 }
    return prev
  }, {} as TokensMapper)
}

function parsedTokensNameMapper(poolDatas: PoolData[]) {
  const tokensNameMapper: { [address: string]: string } = {}

  // eslint-disable-next-line @typescript-eslint/no-for-in-array
  for (const idx in poolDatas) {
    const { underlyingCoinAddresses, underlyingCoins, wrappedCoinAddresses, wrappedCoins, id, lpToken } =
      poolDatas[idx].pool
    const addresses = [...underlyingCoinAddresses, ...wrappedCoinAddresses]
    const tokens = [...underlyingCoins, ...wrappedCoins]

    addresses.map((address, idx) => {
      tokensNameMapper[address] = tokens[idx]
    })

    if (lpToken !== zeroAddress) {
      tokensNameMapper[lpToken] = `${id} LP`
    }
  }
  return tokensNameMapper
}
