import type { MutateFunction } from '@tanstack/react-query'
import type { TxHashError } from '@/ui/TxInfoBar'
import type { WaitForTxReceiptResp } from '@/shared/curve-lib'
import type { Stake } from '@/entities/stake'

import { stakeKeys } from '@/entities/stake'
import { waitForTxStatuses } from '@/shared/curve-lib'

import { logMutation } from '@/shared/lib/logging'
import useStore from '@/store/useStore'

const invalidPoolId = 'Missing poolId'
const invalidProvider = 'Missing signer provider'

export const mutateApproveStake: MutateFunction<WaitForTxReceiptResp, TxHashError, Stake> = async (params) => {
  logMutation(stakeKeys.approveStake(params))
  const { poolId, lpToken } = params
  if (!poolId) throw new Error(invalidPoolId)
  const { provider, pool } = getPoolProvider(poolId)
  const { curve, gas } = useStore.getState()

  await gas.fetchGasInfo(curve)
  const hashes = await pool.stakeApprove(lpToken)
  return await waitForTxStatuses(hashes, provider)
}

export const mutateStake: MutateFunction<WaitForTxReceiptResp, TxHashError, Stake> = async (params) => {
  logMutation(stakeKeys.stake(params))
  const { poolId, lpToken } = params
  if (!poolId) throw new Error(invalidPoolId)
  const { provider, pool } = getPoolProvider(poolId)
  const { curve, gas } = useStore.getState()

  await gas.fetchGasInfo(curve)
  const hash = await pool.stake(lpToken)
  return await waitForTxStatuses([hash], provider)
}

// helpers
function getPoolProvider(poolId: string) {
  const { curve, wallet } = useStore.getState()

  const provider = wallet.getProvider('')
  if (!provider) throw new Error(invalidProvider)

  const pool = curve.getPool(poolId)
  return { provider, pool }
}
