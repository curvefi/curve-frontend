import { t } from '@ui-kit/lib/i18n'
import { showToast } from '@ui-kit/widgets/Toast/toast.util'

/**
 * Show a toast notification. The toast type can be 'pending', 'success', 'error', or 'hint'.
 * When 'pending' is used, a dismiss function is returned to close the toast later.
 * Otherwise, the default auto-dismiss behavior is used.
 */
export function notify(message: string, type: 'pending'): { dismiss: () => void }
export function notify(message: string, type: 'success' | 'error' | 'hint'): void
export function notify(
  message: string,
  type: 'pending' | 'success' | 'error' | 'hint',
): { dismiss: () => void } | void {
  const result = showToast({
    severity: ({ hint: 'info', error: 'error', pending: 'info', success: 'success' } as const)[type],
    title: { hint: t`Hint`, error: t`Error`, pending: t`Pending`, success: t`Success` }[type],
    message,
    keepAlive: type === 'pending',
  })
  if (type === 'pending') return result
}

/**
 * Show a pending toast while the promise is pending, then dismiss it when done.
 */
export async function withPendingToast<T>(promise: Promise<T> | (() => Promise<T>), message: string) {
  const { dismiss: dismissPending } = notify(message, 'pending')
  return await (typeof promise === 'object' ? promise : promise()).finally(dismissPending)
}
