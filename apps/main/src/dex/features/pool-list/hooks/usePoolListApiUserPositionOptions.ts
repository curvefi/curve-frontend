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
  const curvePoolEntries = useMemo(
    () =>
      isHydrated && curveApi?.chainId === chainId
        ? getCurvePoolIdByAddressEntries(curveApi)
        : getCurvePoolIdByAddressEntries(undefined),
    [chainId, curveApi, isHydrated],
  )
  const isCurvePoolListReady = curvePoolEntries.length > 0
  const { data: userPools } = useUserPools({ chainId, userAddress }, isCurvePoolListReady)
  const poolIdByAddress = useMemo(
    () =>
      fromEntries([
        ...getPoolIdByAddressEntries(poolDataCacheMapper),
        ...getPoolIdByAddressEntries(poolDataMapper),
        ...curvePoolEntries,
      ]),
    [curvePoolEntries, poolDataCacheMapper, poolDataMapper],
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
