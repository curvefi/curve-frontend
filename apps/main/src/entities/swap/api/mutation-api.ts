import type { ApproveSwap, Swap } from '@/entities/swap/types'
import type { MutateFunction } from '@tanstack/react-query/build/modern'
import type { TxHashError } from '@/ui/TxInfoBar'
import type { WaitForTxReceiptResp } from '@/shared/curve-lib'

import { logMutation } from '@/utils'
import { waitForTxStatuses } from '@/shared/curve-lib'
import { keys } from '@/entities/swap/model/keys'
import useStore from '@/store/useStore'

const invalidPoolId = 'Missing poolId'
const invalidProvider = 'Missing signer provider'

export const mutateSwapApprove: MutateFunction<WaitForTxReceiptResp, TxHashError, ApproveSwap> = async (params) => {
  logMutation(keys.approveSwap(params))
  const { poolId, isWrapped, fromAmount, fromAddress } = params
  if (!poolId) throw new Error(invalidPoolId)
  const { provider, pool } = getPoolProvider(poolId)
  const { curve, gas } = useStore.getState()

  await gas.fetchGasInfo(curve)
  const hashes = await (isWrapped
    ? pool.swapWrappedApprove(fromAddress, fromAmount)
    : pool.swapApprove(fromAddress, fromAmount))
  return await waitForTxStatuses(hashes, provider)
}

export const mutateSwap: MutateFunction<WaitForTxReceiptResp, TxHashError, Swap> = async (params) => {
  logMutation(keys.swap(params))
  const { poolId, isWrapped, fromAmount, fromAddress, toAddress, maxSlippage } = params
  if (!poolId) throw new Error(invalidPoolId)
  const { provider, pool } = getPoolProvider(poolId)
  const { curve, gas } = useStore.getState()

  await gas.fetchGasInfo(curve)
  const hash = await (isWrapped
    ? pool.swapWrapped(fromAddress, toAddress, fromAmount, +maxSlippage)
    : pool.swap(fromAddress, toAddress, fromAmount, +maxSlippage))
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
