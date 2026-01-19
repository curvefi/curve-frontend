import { useEffect, useState } from 'react'
import { type AlertProps } from '@mui/material/Alert'
import { t } from '@ui-kit/lib/i18n'
import { Toast } from '@ui-kit/shared/ui/Toast'
import { listenWalletNotifications, type WalletNotification } from '../lib/notify'

const Severities = {
  hint: 'info',
  error: 'error',
  pending: 'info',
  success: 'success',
} satisfies Record<WalletNotification['type'], AlertProps['severity']>

const Titles = {
  hint: t`Hint`,
  error: t`Error`,
  pending: t`Pending`,
  success: t`Success`,
} satisfies Record<WalletNotification['type'], string>

export const WalletToast = () => {
  const [notifications, setNotifications] = useState<WalletNotification[]>([])

  useEffect(() => {
    const timeouts: number[] = []
    const dismiss = (notification: WalletNotification): void => {
      setNotifications((prevNotifications: WalletNotification[]) => prevNotifications.filter((n) => n !== notification))
    }
    const add = (notification: WalletNotification): void => {
      setNotifications((prevNotifications: WalletNotification[]) => [...prevNotifications, notification])
      if (notification.autoDismiss) {
        const timeout = window.setTimeout(() => dismiss(notification), notification.autoDismiss)
        timeouts.push(timeout)
      }
    }

    const cleanupListener = listenWalletNotifications(add, dismiss)
    return () => {
      cleanupListener()
      timeouts.forEach(clearTimeout)
    }
  }, [])

  return notifications.map(({ id, type, message, autoDismiss }) => (
    <Toast
      key={id}
      open
      onClose={() => setNotifications((prev) => prev.filter((n) => n.id !== id))}
      severity={Severities[type]}
      title={Titles[type]}
      autoHideDuration={autoDismiss}
    >
      {message}
    </Toast>
  ))
}
