import { t } from '@ui-kit/lib/i18n'
import { showToast } from '@ui-kit/widgets/Toast/toast.util'

export const notify = (message: string, type: 'pending' | 'success' | 'error' | 'hint'): { dismiss: () => void } =>
  showToast({
    severity: ({ hint: 'info', error: 'error', pending: 'info', success: 'success' } as const)[type],
    title: { hint: t`Hint`, error: t`Error`, pending: t`Pending`, success: t`Success` }[type],
    message,
    keepAlive: type === 'pending',
  })

export async function withPendingToast<T>(promise: Promise<T> | (() => Promise<T>), message: string) {
  const { dismiss: dismissPending } = notify(message, 'pending')
  return await (typeof promise === 'object' ? promise : promise()).finally(dismissPending)
}
