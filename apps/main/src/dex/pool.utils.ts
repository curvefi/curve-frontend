import type { PoolTemplate } from '@curvefi/api/lib/pools'
import { getLib, requireLib } from '@evm-ui/features/connect-wallet'
import { shortenAddress } from '@evm-ui/utils'
import type { Address } from '@primitives/address.utils'
import { maybes, type Nullish } from '@primitives/objects.utils'

/** Gets a pool by its ID, throws an error if no pool is found with the given ID. */
export const getPool = (poolIdOrAddress: string | PoolTemplate, lib = requireLib('curveApi')): PoolTemplate =>
  typeof poolIdOrAddress === 'string' ? lib.getPool(poolIdOrAddress) : poolIdOrAddress

export const tryGetPool = (poolIdOrAddress: PoolTemplate | string | Nullish, lib = getLib('curveApi')) =>
  typeof poolIdOrAddress === 'object'
    ? poolIdOrAddress
    : maybes([poolIdOrAddress, lib], (pool, lib) => {
        try {
          return getPool(pool, lib)
        } catch (e) {
          const msg = (e as Error).message
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
