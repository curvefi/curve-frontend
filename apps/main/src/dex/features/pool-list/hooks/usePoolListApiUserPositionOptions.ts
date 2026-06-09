import { useCallback, useMemo } from 'react'
import { useConnection } from 'wagmi'
import { useUserPools } from '@/dex/queries/user-pools.query'
import { useStore } from '@/dex/store/useStore'
import type { ChainId } from '@/dex/types/main.types'
import { getHasPosition, getPoolIdByAddress, normalizeAddress, type PoolListItemOptions } from '../apiPoolList.utils'

export const usePoolListApiUserPositionOptions = (chainId: ChainId) => {
  const { address: userAddress } = useConnection()
  const haveAllPools = useStore(state => state.pools.haveAllPools[chainId])
  const poolDataMapper = useStore(state => state.pools.poolsMapper[chainId])
  const poolDataCacheMapper = useStore(state => state.storeCache.poolsMapper[chainId])
  const { data: userPools } = useUserPools({ chainId, userAddress }, haveAllPools)
  const poolIdByAddress = useMemo(
    () => getPoolIdByAddress(poolDataCacheMapper, poolDataMapper),
    [poolDataCacheMapper, poolDataMapper],
  )
  const userPoolIds = useMemo(() => userPools && new Set(userPools.map(poolId => poolId.toLowerCase())), [userPools])

  return useCallback(
    (poolAddress: string): PoolListItemOptions => {
      const normalizedPoolAddress = normalizeAddress(poolAddress)
      const poolId = poolIdByAddress[normalizedPoolAddress]

      return {
        hasPosition: getHasPosition(userPoolIds, normalizedPoolAddress, poolId),
        poolId,
      }
    },
    [poolIdByAddress, userPoolIds],
  )
}
