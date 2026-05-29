import lodash from 'lodash'
import { type Address, getAddress } from 'viem'
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

const hasNoWrapped = (pool: Pool) => pool?.isPlain || pool?.isFake

const getPoolData = (p: Pool, network: NetworkConfig) => {
  const isWrappedOnly = network.poolIsWrappedOnly[p.id]
  const tokensWrapped = p.wrappedCoins.map((token, idx) => token || shortenAddress(p.wrappedCoinAddresses[idx])!)
  const tokens = isWrappedOnly
    ? tokensWrapped
    : p.underlyingCoins.map((token, idx) => token || shortenAddress(p.underlyingCoinAddresses[idx])!)
  const tokensLowercase = tokens.map(c => c.toLowerCase())
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
  blacklist: Set<Address>,
  network: NetworkConfig,
  failedFetching24hOldVprice?: { [p: string]: boolean } | null,
) {
  const { getPool } = curve
  const { orgUIPath } = network

  const resp = poolList.reduce(
    (prev, poolId) => {
      const pool = getPool(poolId)

      if (blacklist.has(getAddress(pool.address))) {
        return prev
      }

      const poolData = getPoolData(pool, network)

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
        'tokenDecimalsAll',
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
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/prefer-nullish-coalescing -- Existing violation before enabling this rule.
    const gaugeStatus = fulfilledValue(gaugeStatusResult) || null
    // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing -- Existing violation before enabling this rule.
    const isGaugeKilled = fulfilledValue(isGaugeKilledResult) || null

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment -- Existing violation before enabling this rule.
    resp.poolsMapper[pool.id].gauge = { status: gaugeStatus, isKilled: isGaugeKilled }
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment -- Existing violation before enabling this rule.
    resp.poolsMapperCache[pool.id].gauge = { status: gaugeStatus, isKilled: isGaugeKilled }

    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access -- Existing violation before enabling this rule.
    if (gaugeStatus?.rewardsNeedNudging || gaugeStatus?.areCrvRewardsStuckInBridge) {
      log(
        'rewardsNeedNudging, areCrvRewardsStuckInBridge',
        pool.id,
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access -- Existing violation before enabling this rule.
        gaugeStatus.rewardsNeedNudging,
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access -- Existing violation before enabling this rule.
        gaugeStatus.areCrvRewardsStuckInBridge,
      )
    }
  })

  return resp
}
