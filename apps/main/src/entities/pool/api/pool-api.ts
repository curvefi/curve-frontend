import useStore from '@/store/useStore'
import type { QueryFunction } from '@tanstack/react-query'

import { PoolMethodResult, PoolQueryKeyType } from '@/entities/pool'
import { assertPoolValidity } from '@/entities/pool/lib/validation'

export function getPool(id: string) {
  const { curve } = useStore.getState()
  return curve.getPool(id)
}

export const queryLiquidity: QueryFunction<
  PoolMethodResult<'stats.totalLiquidity'>,
  PoolQueryKeyType<'liquidity'>
> = async ({ queryKey }) => {
  // logQuery(queryKey)
  const [, chainId, , poolId ] = queryKey
  const _valid = assertPoolValidity({ chainId, poolId })
  return await getPool(_valid.poolId).stats.totalLiquidity()
}

export const queryVolume: QueryFunction<
  PoolMethodResult<'stats.volume'>,
  PoolQueryKeyType<'volume'>
> = async ({ queryKey }) => {
  // logQuery(queryKey)
  const [, chainId, , poolId ] = queryKey
  const _valid = assertPoolValidity({ chainId, poolId })
  return await getPool(_valid.poolId).stats.volume()
}
