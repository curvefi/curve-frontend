import type { CurveApi, NetworkConfig, PoolData } from '@/dex/types/main.types'
import { getPath } from '@/dex/utils/utilsRouter'
import type { V2Pool } from '@curvefi/prices-api/pools'
import { recordValues } from '@primitives/objects.utils'
import type { CampaignRewards } from '@ui-kit/entities/campaigns'
import { DEX_ROUTES } from '@ui-kit/shared/routes'
import { AVERAGE_CATEGORIES, aprToApy } from '@ui-kit/utils'
import { isVyperVulnerablePool } from './pools.alerts'
import type { PoolListItem } from './pools.types'

const POOL_YIELD_COMPOUND_WINDOW = AVERAGE_CATEGORIES['dex.poolYield.compoundRate'].window

type PoolsCampaignsByAddress = Record<string, CampaignRewards[]>
type PoolIdByAddressSource = Record<string, { pool: Pick<PoolData['pool'], 'address' | 'id'> }>

/**
 * Normalize v2 API addresses so they match legacy curve-js/store pool ids by address.
 */
export const normalizeAddress = (address: string) => address.toLowerCase()

export const getPoolIdByAddressEntries = (poolMapper: PoolIdByAddressSource | undefined) =>
  recordValues(poolMapper ?? {}).map(({ pool }) => [normalizeAddress(pool.address), pool.id] as const)

export const getCurvePoolIdByAddressEntries = (curve: CurveApi) =>
  curve.getPoolList().map(poolId => [normalizeAddress(curve.getPool(poolId).address), poolId] as const)

export const getPoolYieldApy = (apr: number | null | undefined) => aprToApy(apr, POOL_YIELD_COMPOUND_WINDOW)

const getPoolsCampaigns = (campaignsByAddress: PoolsCampaignsByAddress | undefined, poolAddress: string) =>
  campaignsByAddress?.[normalizeAddress(poolAddress)] ?? []

export const getPoolListItem = (
  network: NetworkConfig,
  pool: V2Pool,
  hasPosition: PoolListItem['hasPosition'],
  campaignsByAddress?: PoolsCampaignsByAddress,
): PoolListItem => ({
  ...pool,
  campaigns: getPoolsCampaigns(campaignsByAddress, pool.address),
  hasPosition,
  hasVyperVulnerability: isVyperVulnerablePool(network.chainId, pool.address),
  network: network.id,
  url: getPath({ network: network.id }, `${DEX_ROUTES.PAGE_POOLS}/${pool.address}/deposit`),
})
