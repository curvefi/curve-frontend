import type { Amount, ApproveDeposit, Deposit } from '@/entities/deposit'
import type { MutateFunction } from '@tanstack/react-query'
import type { TxHashError } from '@/ui/TxInfoBar'
import type { WaitForTxReceiptResp } from '@/shared/curve-lib'

import { depositKeys } from '@/entities/deposit'
import { waitForTxStatuses } from '@/shared/curve-lib'

import { logMutation } from '@/shared/lib/logging'
import useStore from '@/store/useStore'

const invalidPoolId = 'Missing poolId'
const invalidProvider = 'Missing signer provider'

export const mutateApproveDeposit: MutateFunction<WaitForTxReceiptResp, TxHashError, ApproveDeposit> = async (
  params,
) => {
  logMutation(depositKeys.approveDeposit(params))
  const { poolId, formType, amounts, isWrapped } = params
  if (!poolId) throw new Error(invalidPoolId)
  const { provider, pool } = getPoolProvider(poolId)
  const { curve, gas } = useStore.getState()

  await gas.fetchGasInfo(curve)
  const parsedAmounts = parseAmountsForAPI(amounts)
  const hashes = await (formType === 'DEPOSIT'
    ? isWrapped
      ? pool.depositWrappedApprove(parsedAmounts)
      : pool.depositApprove(parsedAmounts)
    : isWrapped
      ? pool.depositAndStakeWrappedApprove(parsedAmounts)
      : pool.depositAndStakeApprove(parsedAmounts))
  return await waitForTxStatuses(hashes, provider)
}

export const mutateDeposit: MutateFunction<WaitForTxReceiptResp, TxHashError, Deposit> = async (params) => {
  logMutation(depositKeys.deposit(params))
  const { poolId, formType, amounts, maxSlippage, isWrapped } = params
  if (!poolId) throw new Error(invalidPoolId)
  const { provider, pool } = getPoolProvider(poolId)
  const { curve, gas } = useStore.getState()

  await gas.fetchGasInfo(curve)
  const parsedAmounts = parseAmountsForAPI(amounts)
  const hash = await (formType === 'DEPOSIT'
    ? isWrapped
      ? pool.depositWrapped(parsedAmounts, +maxSlippage)
      : pool.deposit(parsedAmounts, +maxSlippage)
    : isWrapped
      ? pool.depositAndStakeWrapped(parsedAmounts, +maxSlippage)
      : pool.depositAndStake(parsedAmounts, +maxSlippage))
  return await waitForTxStatuses([hash], provider)
}

// helpers
function parseAmountsForAPI(amounts: Amount[]) {
  return amounts.map((a) => (Number(a.value) > 0 ? a.value : '0'))
}

function getPoolProvider(poolId: string) {
  const { curve, wallet } = useStore.getState()

  const provider = wallet.getProvider('')
  if (!provider) throw new Error(invalidProvider)

  const pool = curve.getPool(poolId)
  return { provider, pool }
}
