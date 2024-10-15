import type { QueryFunction } from '@tanstack/react-query'
import type {
  PoolQueryKeyType,
  PoolTokenListResp,
  PoolCurrencyReservesResp,
  PoolDetailsResp,
  PoolSeedAmountsResp,
} from '@/entities/pool'

import curvejsApi from '@/lib/curvejs'
import useStore from '@/store/useStore'
import networks from '@/networks'
import countBy from 'lodash/countBy'

export const poolTokensList: QueryFunction<PoolTokenListResp, PoolQueryKeyType<'poolTokensList'>> = ({ queryKey }) => {
  const [, , chainId, poolId, isWrapped] = queryKey

  if (!chainId || !poolId) return { tokens: [], tokensMapper: {} }

  const { curve, pools } = useStore.getState()
  const cachedPoolData = pools.poolsMapper[chainId]?.[poolId]
  const pool = curve.getPool(poolId)

  const {
    underlyingCoins = cachedPoolData?.tokens ?? [],
    underlyingCoinAddresses = cachedPoolData?.tokenAddresses ?? [],
    underlyingDecimals = [],
    wrappedCoins = [],
    wrappedCoinAddresses = [],
    wrappedDecimals = [],
  } = pool

  if (isWrapped) {
    const wrappedTokensCountBy = countBy(wrappedCoins)
    const wrappedList = wrappedCoins.map((token, idx) => ({
      symbol: token,
      address: wrappedCoinAddresses?.[idx],
      decimals: wrappedDecimals?.[idx],
      haveSameTokenName: wrappedTokensCountBy[token] > 1, // use to display token address if duplicated token names
    }))

    return {
      tokens: wrappedList,
      tokensMapper: wrappedList.reduce((prev, curr) => {
        prev[curr.address] = curr
        return prev
      }, {} as PoolTokenListResp['tokensMapper']),
    }
  }

  const underlyingTokensCountBy = countBy(underlyingCoins)
  const underlyingList = underlyingCoins.map((token, idx) => ({
    symbol: token,
    address: underlyingCoinAddresses?.[idx],
    decimals: underlyingDecimals?.[idx],
    haveSameTokenName: underlyingTokensCountBy[token] > 1, // use to display token address if duplicated token names
  }))

  return {
    tokens: underlyingList,
    tokensMapper: underlyingList.reduce((prev, curr) => {
      prev[curr.address] = curr
      return prev
    }, {} as PoolTokenListResp['tokensMapper']),
  }
}

export const poolSeedAmounts: QueryFunction<PoolSeedAmountsResp[], PoolQueryKeyType<'poolSeedAmounts'>> = async ({
  queryKey,
}) => {
  const [, chainId, , poolId, , isSeed, firstAmount, useUnderlying] = queryKey

  if (!chainId || !poolId || !isSeed || useUnderlying === null) return []

  const { curve } = useStore.getState()
  const pool = curve.getPool(poolId)

  const tokens = useUnderlying ? pool.underlyingCoins : pool.wrappedCoins
  const tokenAddresses = useUnderlying ? pool.underlyingCoinAddresses : pool.wrappedCoinAddresses
  const seedAmounts = await pool.getSeedAmounts(firstAmount, useUnderlying)
  return tokens.map((token, idx) => ({ token, tokenAddress: tokenAddresses[idx], amount: seedAmounts[idx] }))
}

export const poolDetails: QueryFunction<PoolDetailsResp, PoolQueryKeyType<'poolDetails'>> = async ({ queryKey }) => {
  const [, chainId, , poolId] = queryKey

  let resp: PoolDetailsResp = {
    rewardsApy: null,
    volume: '',
    tvl: '',
    parameters: null,
  }

  if (!chainId || !poolId) return resp

  const { curve, pools } = useStore.getState()
  const pool = curve.getPool(poolId)
  const hardcodedTvl = networks[chainId].poolCustomTVL[poolId]

  const [rewardsApy, volume, tvl, parameters] = await Promise.all([
    curvejsApi.pool.poolAllRewardsApy(chainId, pool),
    pool.stats.volume(),
    hardcodedTvl || pool.stats.totalLiquidity(),
    pool.stats.parameters(),
  ])

  // save to store
  const poolsMapper = {
    ...pools.poolsMapper[chainId],
    ...{ [poolId]: { ...pools.poolsMapper[chainId][poolId], parameters } },
  }
  pools.setStateByActiveKey('poolsMapper', chainId.toString(), poolsMapper)

  resp.rewardsApy = rewardsApy
  resp.tvl = tvl
  resp.volume = volume
  resp.parameters = parameters

  return resp
}

export const poolUnderlyingCurrencyReserves: QueryFunction<
  PoolCurrencyReservesResp,
  PoolQueryKeyType<'poolUnderlyingCurrencyReserves'>
> = async ({ queryKey }) => {
  const [, chainId, , poolId = ''] = queryKey

  if (!chainId || !poolId) {
    return {
      poolId,
      tokens: [],
      total: null,
      totalUsd: null,
    }
  }

  const { curve, storeCache, pools } = useStore.getState()
  const poolDataCached = storeCache.poolsMapper[chainId]?.[poolId]
  const pool = curve.getPool(poolId)

  if (!pool && poolDataCached) {
    return {
      poolId,
      tokens: poolDataCached.tokens.map((token, idx) => ({
        token,
        tokenAddress: poolDataCached.tokenAddresses[idx],
        balance: 0,
        balanceUsd: 0,
        usdRate: 0,
        percentShareInPool: '',
      })),
      total: null,
      totalUsd: null,
    }
  }

  const { underlyingCoins, underlyingCoinAddresses } = pool

  const [balances, ...usdRates] = await Promise.all([
    pool.stats.underlyingBalances(),
    ...underlyingCoinAddresses.map((address) => curve.getUsdRate(address)),
  ])

  const resp = underlyingCoinAddresses.reduce(
    (prev, tokenAddress, idx) => getCRData(prev, underlyingCoins[idx], tokenAddress, usdRates[idx], balances[idx]),
    { poolId, total: 0, totalUsd: 0, tokens: [] as CurrencyReservesToken[] }
  )

  const isEmpty = balances.length === 0 || balances.every((b) => +b === 0)
  resp.tokens.map((cr) => getCRTokenPercentShare(cr, isEmpty, pool.isCrypto, resp.totalUsd, resp.total))

  const prevPoolTvl = pools.tvlMapper[chainId]?.value
  if (resp.totalUsd !== Number(prevPoolTvl)) {
    const tvlMapper = {
      ...pools.tvlMapper[chainId],
      [pool.id]: { poolId: pool.id, value: resp.totalUsd, errorMessage: '' },
    }
    pools.setStateByActiveKey('tvlMapper', chainId.toString(), tvlMapper)
  }

  return resp
}

export const poolWrappedCurrencyReserves: QueryFunction<
  PoolCurrencyReservesResp,
  PoolQueryKeyType<'poolWrappedCurrencyReserves'>
> = async ({ queryKey }) => {
  const [, , chainId, poolId, isWrapped] = queryKey

  if (!chainId || !poolId || !isWrapped) {
    return {
      poolId: '',
      tokens: [],
      total: null,
      totalUsd: null,
    }
  }

  const { curve } = useStore.getState()
  const pool = curve.getPool(poolId)
  const { wrappedCoinAddresses, wrappedCoins } = pool

  const [balances, ...usdRates] = await Promise.all([
    pool.stats.wrappedBalances(),
    ...wrappedCoinAddresses.map((address) => curve.getUsdRate(address)),
  ])

  const resp = wrappedCoinAddresses.reduce(
    (prev, tokenAddress, idx) => getCRData(prev, wrappedCoins[idx], tokenAddress, usdRates[idx], balances[idx]),
    { poolId, total: 0, totalUsd: 0, tokens: [] as CurrencyReservesToken[] }
  )

  const isEmpty = balances.length === 0 || balances.every((b) => +b === 0)
  resp.tokens.map((cr: CurrencyReservesToken) =>
    getCRTokenPercentShare(cr, isEmpty, pool.isCrypto, resp.totalUsd, resp.total)
  )

  return resp
}

function getCRData(
  prev: {
    poolId: string
    tokens: CurrencyReservesToken[]
    total: number
    totalUsd: number
  },
  token: string,
  tokenAddress: string,
  usdRate: number,
  balance: string
) {
  const tokenUsdRate = Number.isNaN(usdRate) ? 0 : usdRate
  const tokenBalance = Number(balance)
  const tokenBalanceUsd = tokenBalance * tokenUsdRate
  prev.tokens.push({
    token,
    tokenAddress,
    balance: tokenBalance,
    balanceUsd: tokenBalanceUsd,
    usdRate: tokenUsdRate,
    percentShareInPool: '',
  })
  prev.total += tokenBalance
  prev.totalUsd += tokenBalanceUsd
  return prev
}

function getCRTokenPercentShare(
  cr: CurrencyReservesToken,
  isEmpty: boolean,
  isCrypto: boolean,
  totalUsd: number,
  total: number
) {
  if (isEmpty) {
    cr.percentShareInPool = '0'
  } else if (isCrypto && Number.isNaN(cr.usdRate)) {
    cr.percentShareInPool = 'NaN'
  } else if (isCrypto) {
    cr.percentShareInPool = ((cr.balanceUsd / totalUsd!) * 100).toFixed(2)
  } else {
    cr.percentShareInPool = ((cr.balance / total!) * 100).toFixed(2)
  }
  return cr
}
