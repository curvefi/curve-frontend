import type { PoolTemplate } from '@curvefi/api/lib/pools'
import { getLib, requireLib } from '@evm-ui/features/connect-wallet'
import { shortenAddress } from '@evm-ui/utils'
import { maybes, type Nullish } from '@primitives/objects.utils'

const WRAPPED_ONLY_POOL_IDS = ['pax', 'busd', 'y']

/** Gets a pool by its ID, throws an error if no pool is found with the given ID. */
export const getPool = (poolIdOrAddress: string | PoolTemplate, lib = requireLib('curveApi')): PoolTemplate =>
  typeof poolIdOrAddress === 'string' ? lib.getPool(poolIdOrAddress) : poolIdOrAddress

export const tryGetPool = (poolIdOrAddress: PoolTemplate | string | Nullish, lib = getLib('curveApi')) =>
  typeof poolIdOrAddress === 'object'
    ? poolIdOrAddress
    : maybes([poolIdOrAddress, lib], (poolIdOrAddress, lib) => {
        try {
          return getPool(poolIdOrAddress, lib)
        } catch {
          return undefined
        }
      })

export const isWrappedOnly = (pool: PoolTemplate) => WRAPPED_ONLY_POOL_IDS.includes(pool.id)
export const hasWrapped = (pool: PoolTemplate) => isWrappedOnly(pool) || !(pool?.isPlain || pool?.isFake)

export const getTokens = (pool: PoolTemplate, { wrapped }: { wrapped: boolean }) => ({
  tokens: wrapped
    ? pool.wrappedCoins.map((token, idx) => token || shortenAddress(pool.wrappedCoinAddresses[idx]))
    : pool.underlyingCoins.map((token, idx) => token || shortenAddress(pool.underlyingCoinAddresses[idx])),
  tokenAddresses: wrapped ? pool.wrappedCoinAddresses : pool.underlyingCoinAddresses,
  tokenAddressesAll: wrapped
    ? pool.wrappedCoinAddresses
    : [...pool.underlyingCoinAddresses, ...pool.wrappedCoinAddresses],
})
