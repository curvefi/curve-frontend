import lodash from 'lodash'
import {
  CurveApi,
  NetworkConfig,
  Pool,
  PoolData,
  PoolDataCache,
  PoolDataCacheMapper,
  PoolDataMapper,
} from '@/dex/types/main.types'
import { fulfilledValue, getCurvefiUrl } from '@/dex/utils'
import { PromisePool } from '@supercharge/promise-pool'
import { log } from '@ui-kit/lib'
import { shortenAddress } from '@ui-kit/utils'

export const hasNoWrapped = (pool: Pool) => pool?.isPlain || pool?.isFake

const getPoolData = (p: Pool, network: NetworkConfig, storedPoolData: PoolData | undefined) => {
  const isWrappedOnly = network.poolIsWrappedOnly[p.id]
  const tokensWrapped = p.wrappedCoins.map((token, idx) => token || shortenAddress(p.wrappedCoinAddresses[idx])!)
  const tokens = isWrappedOnly
    ? tokensWrapped
    : p.underlyingCoins.map((token, idx) => token || shortenAddress(p.underlyingCoinAddresses[idx])!)
  const tokensLowercase = tokens.map((c) => c.toLowerCase())
  const tokensAll = isWrappedOnly ? tokensWrapped : [...tokens, ...tokensWrapped]
  const tokenAddresses = isWrappedOnly ? p.wrappedCoinAddresses : p.underlyingCoinAddresses
  const tokenAddressesAll = isWrappedOnly
    ? p.wrappedCoinAddresses
    : [...p.underlyingCoinAddresses, ...p.wrappedCoinAddresses]
  const tokenDecimalsAll = isWrappedOnly ? p.wrappedDecimals : [...p.underlyingDecimals, ...p.wrappedDecimals]
  const tokensCountBy = lodash.countBy(tokens)

  const poolData: PoolData = {
    pool: p,
    chainId: network.chainId,
    curvefiUrl: '',

    // stats
    currenciesReserves: null,
    parameters: storedPoolData?.parameters
      ? storedPoolData.parameters
      : {
          A: '',
          adminFee: '',
          fee: '',
          future_A: undefined,
          future_A_time: undefined,
          gamma: undefined,
          initial_A: undefined,
          initial_A_time: undefined,
          lpTokenSupply: '',
          virtualPrice: '',
        },
    hasVyperVulnerability: p.hasVyperVulnerability(),
    hasWrapped: isWrappedOnly ?? !hasNoWrapped(p),
    isWrapped: isWrappedOnly ?? false,
    tokenAddressesAll,
    tokenDecimalsAll,
    tokenAddresses,
    tokens,
    tokensCountBy,
    tokensAll,
    tokensLowercase,
    failedFetching24hOldVprice: false,
    gauge: {
      status: null,
      isKilled: null,
    },
  }

  return poolData
}

export async function getPools(
  curve: CurveApi,
  poolList: string[],
  network: NetworkConfig,
  poolsMapper: PoolDataMapper = {},
  failedFetching24hOldVprice?: { [p: string]: boolean } | null,
) {
  const { getPool } = curve
  const { orgUIPath } = network

  const resp = poolList.reduce(
    (prev, poolId) => {
      const pool = getPool(poolId)
      const poolData = getPoolData(pool, network, poolsMapper[poolId])

      poolData.failedFetching24hOldVprice = failedFetching24hOldVprice?.[pool.address] ?? false
      poolData.curvefiUrl = getCurvefiUrl(poolId, orgUIPath)

      prev.poolsMapper[poolId] = poolData

      prev.poolsMapperCache[poolId] = lodash.pick(poolData, [
        'hasWrapped',
        'gauge',
        'tokens',
        'tokensCountBy',
        'tokensAll',
        'tokensLowercase',
        'tokenAddresses',
        'tokenAddressesAll',
        'pool.id',
        'pool.name',
        'pool.address',
        'pool.gauge.address',
        'pool.lpToken',
        'pool.implementation',
        'pool.isCrypto',
        'pool.isFactory',
        'pool.isLending',
        'pool.referenceAsset',
        'pool.isNg',
      ]) as PoolDataCache

      return prev
    },
    { poolsMapper: {}, poolsMapperCache: {} } as { poolsMapper: PoolDataMapper; poolsMapperCache: PoolDataCacheMapper },
  )

  // get gauge info
  await PromisePool.for(Object.values(resp.poolsMapper)).process(async ({ pool }) => {
    const [gaugeStatusResult, isGaugeKilledResult] = await Promise.allSettled([
      pool.gaugeStatus(),
      pool.isGaugeKilled(),
    ])
    const gaugeStatus = fulfilledValue(gaugeStatusResult) || null
    const isGaugeKilled = fulfilledValue(isGaugeKilledResult) || null

    resp.poolsMapper[pool.id].gauge = { status: gaugeStatus, isKilled: isGaugeKilled }
    resp.poolsMapperCache[pool.id].gauge = { status: gaugeStatus, isKilled: isGaugeKilled }

    if (gaugeStatus?.rewardsNeedNudging || gaugeStatus?.areCrvRewardsStuckInBridge) {
      log(
        'rewardsNeedNudging, areCrvRewardsStuckInBridge',
        pool.id,
        gaugeStatus.rewardsNeedNudging,
        gaugeStatus.areCrvRewardsStuckInBridge,
      )
    }
  })

  return resp
}
