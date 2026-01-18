import { useMemo } from 'react'
import { isAddress, isAddressEqual, type Address } from 'viem'
import { useStore } from '../store/useStore'

/**
 * Tries to get a pool id from a value that is either an address or a pool id already.
 * Might get rewritten when we refactor out the pool stores and its mappers for a tanstack query.
 */
export function usePoolIdByAddressOrId({ chainId, poolIdOrAddress }: { chainId: number; poolIdOrAddress: string }) {
  const poolData = useStore((state) => state.pools.poolsMapper[chainId])
  const poolDataCache = useStore((state) => state.storeCache.poolsMapper[chainId])

  return useMemo(() => {
    // If not an address format, assume it's already a pool ID
    if (!isAddress(poolIdOrAddress, { strict: false })) {
      return poolIdOrAddress
    }

    // Check current pool data first
    const currentMatch = Object.values(poolData ?? {}).find(({ pool: { address } }) =>
      isAddressEqual(address as Address, poolIdOrAddress),
    )

    if (currentMatch) return currentMatch.pool.id

    // Fallback to cached pool data
    const cachedMatch = Object.values(poolDataCache ?? {}).find(({ pool: { address } }) =>
      isAddressEqual(address as Address, poolIdOrAddress),
    )

    return cachedMatch?.pool?.id
  }, [poolIdOrAddress, poolData, poolDataCache])
}
