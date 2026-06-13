import { useCallback, useMemo } from 'react'
import { useConnection } from 'wagmi'
import { useUserPools } from '@/dex/queries/user-pools.query'
import { useStore } from '@/dex/store/useStore'
import type { ChainId } from '@/dex/types/main.types'
import { fromEntries } from '@primitives/objects.utils'
import { useCurve } from '@ui-kit/features/connect-wallet'
import {
  getCurvePoolIdByAddressEntries,
  getHasPosition,
  getPoolIdByAddressEntries,
  normalizeAddress,
  type PoolListItemOptions,
} from '../apiPoolList.utils'

export const usePoolListApiUserPositionOptions = (chainId: ChainId) => {
  const { curveApi, isHydrated } = useCurve()
  const { address: userAddress } = useConnection()
  const poolDataMapper = useStore(state => state.pools.poolsMapper[chainId])
  const poolDataCacheMapper = useStore(state => state.storeCache.poolsMapper[chainId])
  const poolIdSource = poolDataMapper ?? poolDataCacheMapper
  const curveApiForChain = isHydrated && curveApi?.chainId === chainId ? curveApi : undefined
  const { data: userPools } = useUserPools({ chainId, userAddress }, curveApiForChain !== undefined)
  const poolIdByAddress = useMemo(
    () =>
      fromEntries(
        curveApiForChain ? getCurvePoolIdByAddressEntries(curveApiForChain) : getPoolIdByAddressEntries(poolIdSource),
      ),
    [curveApiForChain, poolIdSource],
  )
  const userPoolIds = useMemo(() => userPools && new Set(userPools.map(normalizeAddress)), [userPools])

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
