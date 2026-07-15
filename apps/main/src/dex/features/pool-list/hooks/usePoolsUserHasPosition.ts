import { useCallback, useMemo } from 'react'
import { useConnection } from 'wagmi'
import { useUserPools } from '@/dex/queries/user-pools.query'
import { useStore } from '@/dex/store/useStore'
import type { ChainId, CurveApi, PoolData } from '@/dex/types/main.types'
import { fromEntries, notFalsy, recordValues } from '@primitives/objects.utils'
import { useCurve } from '@ui-kit/features/connect-wallet'

type PoolIdByAddressSource = Record<string, { pool: Pick<PoolData['pool'], 'address' | 'id'> }>

const normalizeAddress = (address: string) => address.toLowerCase()

const getCurvePoolIdByAddressEntries = (curve: CurveApi) =>
  curve.getPoolList().map(poolId => [normalizeAddress(curve.getPool(poolId).address), poolId] as const)

const getPoolIdByAddressEntries = (poolMapper: PoolIdByAddressSource | undefined) =>
  recordValues(poolMapper ?? {}).map(({ pool }) => [normalizeAddress(pool.address), pool.id] as const)

export const usePoolsUserHasPosition = (chainId: ChainId) => {
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
    (poolAddress: string) => {
      const normalizedPoolAddress = normalizeAddress(poolAddress)
      const poolId = poolIdByAddress[normalizedPoolAddress]

      return userPoolIds && notFalsy(poolId, normalizedPoolAddress).some(id => userPoolIds.has(normalizeAddress(id)))
    },
    [poolIdByAddress, userPoolIds],
  )
}
