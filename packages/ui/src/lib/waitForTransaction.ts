import { toArray } from '@primitives/array.utils'
import { waitFor } from '@primitives/promise.utils'
import { Duration } from '@ui/features/themes/design/0_primitives'
import { notify } from '@ui/features/toast/Toast/notify'

/** Check before execution, then pass confirmation results to the condition until satisfied and return them. */
export async function waitForTransaction<T, TResult>({
  onExecute,
  waitForConfirmation,
  isSatisfied,
  onSatisfiedMessage,
  timeout = Duration.TransactionPollTimeout,
}: {
  onExecute: () => Promise<T[] | T>
  waitForConfirmation: (transaction: T) => Promise<TResult>
  isSatisfied: (confirmations?: TResult[]) => boolean | Promise<boolean>
  onSatisfiedMessage?: string
  timeout?: number
}) {
  if (await isSatisfied()) return
  const results = await onExecute()
  const transactions = toArray(results)
  if (transactions.length > 0) {
    const confirmations = await Promise.all(transactions.map(waitForConfirmation))
    if (onSatisfiedMessage) notify(onSatisfiedMessage, 'success')
    await waitFor(() => isSatisfied(confirmations), { timeout })
    return confirmations
  }
}
