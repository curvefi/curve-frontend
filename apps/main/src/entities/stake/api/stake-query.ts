import type { QueryFunction } from '@tanstack/react-query'
import type { StakeQueryKeyType } from '@/entities/stake'

import { warnIncorrectEstGas } from '@/lib/curvejs'
import useStore from '@/store/useStore'

export const stakeApproval: QueryFunction<boolean, StakeQueryKeyType<'stakeApproval'>> = async ({ queryKey }) => {
  const [, chainId, , poolId, , , lpToken] = queryKey

  let resp = false

  if (!chainId || !poolId) return resp

  const { curve } = useStore.getState()
  const pool = curve.getPool(poolId)

  return await pool.stakeIsApproved(lpToken)
}
export const stakeEstGas: QueryFunction<EstimatedGas, StakeQueryKeyType<'stakeEstGas'>> = async ({ queryKey }) => {
  const [, chainId, , poolId, , , isApproved, lpToken] = queryKey

  let resp: EstimatedGas = null

  if (!chainId || !poolId) return resp

  const { curve } = useStore.getState()
  const pool = curve.getPool(poolId)

  resp = isApproved ? await pool.estimateGas.stake(lpToken) : await pool.estimateGas.stakeApprove(lpToken)
  warnIncorrectEstGas(chainId, resp)

  return resp
}
