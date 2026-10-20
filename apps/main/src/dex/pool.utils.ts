import type { PoolTemplate } from '@curvefi/api/lib/pools'
import { getLib, requireLib } from '@evm-ui/features/connect-wallet'
import { shortenAddress } from '@evm-ui/utils'
import type { Address } from '@primitives/address.utils'
import { maybes, type Nullish } from '@primitives/objects.utils'

/** Gets a pool by its address, throws an error if no pool is found. */
export const getPool = (poolAddress: string | PoolTemplate, lib = requireLib('curveApi')): PoolTemplate =>
  typeof poolAddress === 'string' ? lib.getPool(poolAddress) : poolAddress

export const tryGetPool = (poolAddress: PoolTemplate | string | Nullish, lib = getLib('curveApi')) =>
  typeof poolAddress === 'object'
    ? poolAddress
    : maybes([poolAddress, lib], (pool, lib) => {
        try {
          return getPool(pool, lib)
        } catch (e) {
          const msg = (e as Error).message
          // Pool with id is phased out but the library can still throw this if somebody uses a non-address in the URL.
          if ([`Pool with address ${pool} not found`, `Pool with id ${pool} not found`].includes(msg)) return undefined
          throw e
        }
      })

export const hasWrapped = (pool: PoolTemplate | Nullish) => pool && !(pool?.isPlain || pool?.isFake)

export const getTokens = (
  { underlyingCoinAddresses, underlyingCoins, wrappedCoinAddresses, wrappedCoins }: PoolTemplate,
  { wrapped }: { wrapped: boolean },
) => ({
  tokens: wrapped
    ? wrappedCoins.map((token, idx) => token || shortenAddress(wrappedCoinAddresses[idx]))
    : underlyingCoins.map((token, idx) => token || shortenAddress(underlyingCoinAddresses[idx])),
  tokenAddresses: (wrapped ? wrappedCoinAddresses : underlyingCoinAddresses) as Address[],
  tokenAddressesAll: (wrapped
    ? wrappedCoinAddresses
    : [...underlyingCoinAddresses, ...wrappedCoinAddresses]) as Address[],
})
