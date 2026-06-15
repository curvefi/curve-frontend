import type { CurveApi, NetworkConfig, PoolData } from '@/dex/types/main.types'
import { getPath } from '@/dex/utils/utilsRouter'
import type { V2Pool } from '@curvefi/prices-api/pools'
import { notFalsy, recordValues } from '@primitives/objects.utils'
import { DEX_ROUTES } from '@ui-kit/shared/routes'
import type { PoolListItem } from './poolList.types'

const VYPER_EXPLOIT_VERSIONS = new Set(['0.2.15', '0.2.16', '0.3.0'])

export type PoolIdByAddressSource = Record<string, { pool: Pick<PoolData['pool'], 'address' | 'id'> }>
export type PoolListItemOptions = {
  hasPosition: boolean | undefined
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

export const getPoolListItem = (
  network: NetworkConfig,
  pool: V2Pool,
  { hasPosition }: PoolListItemOptions,
): PoolListItem => ({
  ...pool,
  hasPosition,
  hasVyperVulnerability: pool.vyperVersion != null && VYPER_EXPLOIT_VERSIONS.has(pool.vyperVersion),
  network: network.id,
  url: getPath({ network: network.id }, `${DEX_ROUTES.PAGE_POOLS}/${pool.address}/deposit`),
})
