import type { Amount } from '@/entities/deposit'
import type { UseMutationResult } from '@tanstack/react-query/build/modern'
import type { WaitForTxReceiptResp } from '@/shared/curve-lib'

export function amountsDescription(amounts: Amount[]) {
  return amounts
    .filter((a) => !!Number(a.value))
    .map((a) => `${a.value} ${a.token}`)
    .join(', ')
}

export function tokensDescription(amounts: Amount[]) {
  return amounts
    .filter((a) => !!Number(a.value))
    .map((a) => `${a.token}`)
    .join(', ')
}

// "current" | "pending" | "in-progress" | "succeeded" | "failed"
export function getMutationStepStatus(enabled: boolean, status: UseMutationResult['status']) {
  if ((status === 'idle' || status === 'error') && enabled) return 'current'
  if (status === 'pending') return 'in-progress'
  if (status === 'success') return 'succeeded'
  return 'pending'
}

export function getMutationStepLabel(
  isApproval: boolean,
  status: UseMutationResult['status'],
  customMessages?: { successMessage: string; failedMessage: string; pendingMessage: string }
) {
  const { successMessage, pendingMessage } = customMessages ?? {}

  if (status === 'success') {
    if (successMessage) return successMessage
    if (isApproval) return `Spending Approved`
    return `Complete`
  }

  if (pendingMessage) return pendingMessage
  if (isApproval) return `Approve Spending`
  return ''
}

export function showStepApprove(
  isApproved: boolean,
  approvalsTx: WaitForTxReceiptResp | undefined,
  submitTx: WaitForTxReceiptResp | undefined
) {
  const haveApproveTx = (approvalsTx?.success || approvalsTx?.failed || '')?.length > 0
  const haveSubmitTx = (submitTx?.success || submitTx?.failed || '')?.length > 0

  if (haveApproveTx) return true
  return !isApproved && !haveSubmitTx
}
