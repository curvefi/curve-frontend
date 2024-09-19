import type { Amount, ApproveWithdraw, Withdraw, Claim, Unstake } from '@/entities/withdraw'
import type { MutateFunction } from '@tanstack/react-query/build/modern'
import type { TxHashError } from '@/ui/TxInfoBar'

import { logMutation } from '@/utils'
import { waitForTxStatuses, type WaitForTxReceiptResp } from '@/shared/curve-lib'
import { keys } from '@/entities/withdraw'
import useStore from '@/store/useStore'

const invalidPoolId = 'Missing poolId'
const invalidProvider = 'Missing signer provider'

export const mutationApproveWithdraw: MutateFunction<WaitForTxReceiptResp, TxHashError, ApproveWithdraw> = async (
  params
) => {
  logMutation(keys.approveWithdraw(params))
  const { poolId, selected, amounts: formAmounts, lpToken } = params
  if (!poolId) throw new Error(invalidPoolId)
  const { provider, pool } = getPoolProvider(poolId)
  const { curve, gas } = useStore.getState()

  await gas.fetchGasInfo(curve)
  const amounts = parseAmountsForAPI(formAmounts)
  let hashes: string[] = []

  if (selected === 'one-coin') {
    hashes = await pool.withdrawOneCoinApprove(lpToken)
  }

  if (selected === 'balanced') {
    hashes = await pool.withdrawApprove(lpToken)
  }

  if (selected.startsWith('imbalance')) {
    hashes = await pool.withdrawImbalanceApprove(amounts)
  }

  return await waitForTxStatuses(hashes, provider)
}

export const mutationWithdraw: MutateFunction<WaitForTxReceiptResp, TxHashError, Withdraw> = async (params) => {
  logMutation(keys.withdraw(params))
  const { poolId, isWrapped, lpToken, amounts: formAmounts, selectedTokenAddress, maxSlippage, selected } = params
  if (!poolId) throw new Error(invalidPoolId)
  const { provider, pool } = getPoolProvider(poolId)
  const { curve, gas } = useStore.getState()

  await gas.fetchGasInfo(curve)
  let hash = ''

  if (selected === 'one-coin') {
    hash = await (isWrapped
      ? pool.withdrawOneCoinWrapped(lpToken, selectedTokenAddress, +maxSlippage)
      : pool.withdrawOneCoin(lpToken, selectedTokenAddress, +maxSlippage))
  }

  if (selected === 'balanced' || selected === 'custom-lpToken') {
    hash = await (isWrapped ? pool.withdrawWrapped(lpToken, +maxSlippage) : pool.withdraw(lpToken, +maxSlippage))
  }

  if (selected.startsWith('custom-amounts')) {
    const amounts = parseAmountsForAPI(formAmounts)
    hash = await (isWrapped
      ? pool.withdrawImbalanceWrapped(amounts, +maxSlippage)
      : pool.withdrawImbalance(amounts, +maxSlippage))
  }

  return await waitForTxStatuses([hash], provider)
}

export const mutationUnstake: MutateFunction<WaitForTxReceiptResp, TxHashError, Unstake> = async (params) => {
  logMutation(keys.unstake(params))
  const { poolId, gauge } = params
  if (!poolId) throw new Error(invalidPoolId)
  const { provider, pool } = getPoolProvider(poolId)
  const { curve, gas } = useStore.getState()

  await gas.fetchGasInfo(curve)
  const hash = await pool.unstake(gauge)
  return await waitForTxStatuses([hash], provider)
}

export const mutationClaim: MutateFunction<WaitForTxReceiptResp, TxHashError, Claim> = async (params) => {
  logMutation(keys.claim(params))
  const { poolId, claimType } = params
  if (!poolId) throw new Error(invalidPoolId)
  const { provider, pool } = getPoolProvider(poolId)
  const { curve, gas } = useStore.getState()

  await gas.fetchGasInfo(curve)
  const isClaimCrv = claimType === 'CLAIM_CRV'
  const hash = await (isClaimCrv ? pool.claimCrv() : pool.claimRewards())
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
