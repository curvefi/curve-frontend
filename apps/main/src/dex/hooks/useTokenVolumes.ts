import { useCallback } from 'react'
import { usePoolVolumes } from '@/dex/queries/pool-volume.query'
import { useStore } from '@/dex/store/useStore'
import type { ChainParams } from '@evm-ui/lib/model'
import { maybe } from '@primitives/objects.utils'
import { useMappedQuery } from '@ui/features/queries/util'

export const useTokenVolumes = ({ chainId }: ChainParams) => {
  const poolsMapper = useStore(state => maybe(chainId, chainId => state.pools.poolsMapper[chainId]))
  const poolVolumes = usePoolVolumes({ chainId })

  return useMappedQuery(
    poolVolumes,
    useCallback(
      volumes =>
        Object.values(poolsMapper ?? {}).reduce<Record<string, number>>((tokenVolumes, poolData) => {
          const volume = Number(volumes[poolData.pool.id])
          const tokenAddresses = new Set(poolData.tokenAddressesAll.map(address => address.toLowerCase()))

          for (const tokenAddress of tokenAddresses) {
            tokenVolumes[tokenAddress] = (tokenVolumes[tokenAddress] ?? 0) + volume
          }

          return tokenVolumes
        }, {}),
      [poolsMapper],
    ),
  )
}
