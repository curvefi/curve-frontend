import { Hex } from 'viem'
import { notify } from '@ui-kit/features/connect-wallet'
import { type Config, waitForTransactionReceipt } from '@wagmi/core'

/**
 * Handles a promise with a timeout. If the promise does not resolve within the specified timeout, it rejects with an error.
 */
export const handleTimeout = <T>(promise: Promise<T>, timeout: number, message?: string): Promise<T> =>
  new Promise((resolve, reject) => {
    const id = setTimeout(() => {
      clearTimeout(id)
      reject(new Error(message || `Promise timed out after ${timeout}ms`))
    }, timeout)
    promise.then(resolve, reject)
  })

/**
 * Waits for a callback to return a truthy value, polling at specified intervals, with a timeout.
 */
export const waitFor = async (
  callback: () => any,
  { timeout, step = 1000, message }: { timeout: number; message?: string; step?: number },
) => {
  const waitUntil = async () => {
    while (!(await callback())) {
      await new Promise((resolve) => setTimeout(resolve, step))
    }
  }
  await handleTimeout<void>(waitUntil(), timeout, message)
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
  timeout = 2 * 60 * 1000, // 2 minutes
}: {
  onApprove: () => Promise<Hex[]>
  message: string
  isApproved: () => Promise<boolean>
  config: Config
  timeout?: number
}) {
  if (await isApproved()) return
  await Promise.all((await onApprove()).map((hash) => waitForTransactionReceipt(config, { hash })))
  notify(message, 'success')
  await waitFor(isApproved, { timeout })
}
