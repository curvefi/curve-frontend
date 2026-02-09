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
 * Waits for approval by checking isApproved, and if not approved, calls onApprove,
 * waits for the transactions to be mined and then waits until isApproved returns true.
 */
export async function waitForApproval({
  onApprove,
  config,
  isApproved,
  message,
  timeout = Duration.PollTimeout,
}: {
  onApprove: () => Promise<Hex[]>
  message: string
  isApproved: () => Promise<boolean>
  config: Config
  timeout?: number
}) {
  if (await isApproved()) return
  const approvalHashes = await onApprove()
  if (approvalHashes.length > 0) {
    await Promise.all(approvalHashes.map((hash) => waitForTransactionReceipt(config, { hash })))
    notify(message, 'success')
    await waitFor(isApproved, { timeout })
  }
}
