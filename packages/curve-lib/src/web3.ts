import type { BrowserProvider } from 'ethers'

import { TxHashError } from 'ui/src/TxInfoBar'

export function gweiToEther(gwei: number) {
  return gwei / 1e9
}

export function gweiToWai(gwei: number) {
  return Math.trunc(gwei * 1e9)
}

export function weiToEther(wei: number) {
  return wei / 1e18
}

export function weiToGwei(wai: number) {
  return Math.trunc(wai) / 1e9
}

export function getDecimalLength(val: string) {
  return val.includes('.') ? val.split('.')[1].length : 0
}

export enum TxStatus {
  'failed' = 'failed',
  'succeeded' = 'succeeded',
  'pending' = 'pending',
}

export type WaitForTxReceiptResp = {
  success: string[]
  failed: string[]
}

export async function waitForTxStatuses(hashes: string[], provider: BrowserProvider): Promise<WaitForTxReceiptResp> {
  const resp = (await Promise.all(hashes.map((hash) => provider.waitForTransaction(hash)))).reduce(
    (prev, txReceipt) => {
      if (txReceipt) {
        const txStatus = getTxStatus(txReceipt.status)
        if (txStatus === TxStatus.succeeded) prev.success.push(txReceipt.hash)
        if (txStatus === TxStatus.failed) prev.failed.push(txReceipt.hash)
      }
      return prev
    },
    { success: [], failed: [] } as WaitForTxReceiptResp
  )

  if (!!resp.success.length && !!resp.failed.length) {
    throw new TxHashError(`Some transactions statuses failed.`, resp)
  }
  if (resp.failed.length > 1) throw new TxHashError(`Transactions statuses failed.`, resp)
  if (resp.failed.length === 1) throw new TxHashError('Transaction status failed.', resp)
  return resp
}

// helpers
function getTxStatus(status: number | null | undefined) {
  if (status === 0) return TxStatus.failed
  if (status === 1) return TxStatus.succeeded
  return TxStatus.pending
}
