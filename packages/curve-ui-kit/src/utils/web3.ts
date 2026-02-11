import { Hex } from 'viem'
import { notify } from '@ui-kit/features/connect-wallet'
import { Duration } from '@ui-kit/themes/design/0_primitives'
import { waitFor } from '@ui-kit/utils/time.utils'
import { type Config, waitForTransactionReceipt } from '@wagmi/core'

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

/**
 * Waits for transaction execution by checking isSatisfied, and if not satisfied,
 * calls onExecute, waits for the transactions to be mined and then waits until
 * isSatisfied returns true.
 */
export async function waitForTransaction({
  onExecute,
  config,
  isSatisfied,
  onSatisfiedMessage,
  timeout = Duration.TransactionPollTimeout,
}: {
  onExecute: () => Promise<Hex[] | Hex>
  onSatisfiedMessage?: string
  isSatisfied: () => Promise<boolean>
  config: Config
  timeout?: number
}) {
  if (await isSatisfied()) return
  const results = await onExecute()
  const txHashes = Array.isArray(results) ? results : [results]
  if (txHashes.length > 0) {
    await Promise.all(txHashes.map((hash) => waitForTransactionReceipt(config, { hash })))
    if (onSatisfiedMessage) notify(onSatisfiedMessage, 'success')
    await waitFor(isSatisfied, { timeout })
    return txHashes
  }
}

export const waitForApproval = async ({
  onApprove,
  config,
  isApproved,
  message,
  timeout = Duration.TransactionPollTimeout,
}: {
  onApprove: () => Promise<Hex[]>
  message: string
  isApproved: () => Promise<boolean>
  config: Config
  timeout?: number
}) =>
  await waitForTransaction({
    onExecute: onApprove,
    config,
    isSatisfied: isApproved,
    onSatisfiedMessage: message,
    timeout,
  })
