import { countBy, sumBy } from 'lodash'
import type { CurveApi, NetworkConfig, PoolData, RewardsApy } from '@/dex/types/main.types'
import { getPath } from '@/dex/utils/utilsRouter'
import type { V2Pool } from '@curvefi/prices-api/pools'
import { notFalsy, recordValues } from '@primitives/objects.utils'
import { DEX_ROUTES } from '@ui-kit/shared/routes'
import { decimal } from '@ui-kit/utils'
import type { PoolListItem } from './types'

const VYPER_EXPLOIT_VERSIONS = new Set(['0.2.15', '0.2.16', '0.3.0'])

export type PoolIdByAddressSource = Record<string, { pool: Pick<PoolData['pool'], 'address' | 'id'> }>
export type PoolListItemOptions = {
  hasPosition: boolean | undefined
  poolId: string | undefined
}

/**
 * Normalize v2 API addresses so they match legacy curve-js/store pool ids by address.
 */
export const normalizeAddress = (address: string) => address.toLowerCase()

export const getPoolIdByAddressEntries = (poolMapper: PoolIdByAddressSource | undefined) =>
  recordValues(poolMapper ?? {}).map(({ pool }) => [normalizeAddress(pool.address), pool.id] as const)

export const getCurvePoolIdByAddressEntries = (curve: CurveApi) =>
  curve.getPoolList().map(poolId => [normalizeAddress(curve.getPool(poolId).address), poolId] as const)

export const getHasPosition = (
  userPoolIds: Set<string> | undefined,
  poolAddress: string,
  poolId: string | undefined,
) => (userPoolIds ? notFalsy(poolId, poolAddress).some(id => userPoolIds.has(normalizeAddress(id))) : undefined)

const getPoolRewards = (pool: V2Pool, poolId: string): RewardsApy => {
  const poolAddress = normalizeAddress(pool.address)
  const gaugeAddress = pool.gauge?.address ? normalizeAddress(pool.gauge.address) : ''

  return {
    poolId,
    // Match curve-js RewardsApy: missing base APRs become 0 and no CRV rewards are represented as [0, 0].
    base: {
      day: `${pool.baseDailyApr ?? 0}`,
      week: `${pool.baseWeeklyApr ?? 0}`,
    },
    crv: [pool.crvApr ?? 0, pool.crvAprBoosted ?? 0],
    other: pool.extraRewardsApr
      .filter(({ apr }) => apr > 0)
      .map((reward, index) => ({
        apy: reward.apr,
        decimals: reward.decimals ?? undefined,
        gaugeAddress,
        name: reward.name ?? undefined,
        symbol: reward.symbol ?? '',
        tokenAddress: reward.address ? normalizeAddress(reward.address) : `${poolAddress}-${index}`,
        tokenPrice: reward.price ?? undefined,
      })),
    error: {},
  }
}

/** Legacy pool list components data shape adapter */
export const getPoolListItem = (network: NetworkConfig, pool: V2Pool, options: PoolListItemOptions): PoolListItem => {
  const poolAddress = normalizeAddress(pool.address)
  const poolId = options.poolId ?? poolAddress
  const gaugeAddress = pool.gauge?.address ? normalizeAddress(pool.gauge.address) : ''
  const tokens = pool.coins.map(({ symbol }) => symbol)
  const tokenAddresses = pool.coins.map(({ address }) => normalizeAddress(address))
  const tokenDecimals = pool.coins.map(({ decimals }) => decimals ?? 18)
  const rewards = getPoolRewards(pool, poolId)
  const crvApr = pool.crvAprBoosted ?? pool.crvApr ?? 0
  const incentivesApr = sumBy(rewards.other, 'apy')

  return {
    chainId: network.chainId,
    pool: {
      id: poolId,
      name: pool.name,
      address: poolAddress,
      gauge: { address: gaugeAddress },
      lpToken: '', // not used in the new list
      isCrypto: false, // not used in the new list
      isNg: false, // not used in the new list
      isFactory: false, // not used in the new list
      isLending: false, // not used in the new list
      implementation: '', // not used in the new list
      referenceAsset: '', // not used in the new list
    } as PoolData['pool'],
    gauge: {
      isKilled: pool.gauge?.isKilled ?? null,
      status: null, // not used in the new list
    },
    hasWrapped: false, // not used in the new list
    hasVyperVulnerability: pool.vyperVersion != null && VYPER_EXPLOIT_VERSIONS.has(pool.vyperVersion),
    isWrapped: false, // not used in the new list
    tokenAddresses,
    tokenAddressesAll: tokenAddresses,
    tokenDecimalsAll: tokenDecimals,
    tokens,
    tokensCountBy: countBy(tokens),
    tokensAll: tokens,
    tokensLowercase: tokens.map(token => token.toLowerCase()),
    curvefiUrl: '', // not used in the new list
    failedFetching24hOldVprice: false, // not used in the new list
    rewards,
    volume: decimal(pool.tradingVolume24h),
    tvl: decimal(pool.tvlUsd),
    hasPosition: options.hasPosition,
    network: network.id,
    url: getPath({ network: network.id }, `${DEX_ROUTES.PAGE_POOLS}/${poolAddress}/deposit`),
    tags: [], // not used in the new list
    totalAPR: crvApr + incentivesApr,
  }
}
