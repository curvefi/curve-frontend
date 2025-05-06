import { useEffect, useState } from 'react'
import Alert, { type AlertProps } from '@mui/material/Alert'
import AlertTitle from '@mui/material/AlertTitle'
import Container from '@mui/material/Container'
import Snackbar from '@mui/material/Snackbar'
import Typography from '@mui/material/Typography'
import { t } from '@ui-kit/lib/i18n'
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

export const WalletToast = ({ headerHeight }: { headerHeight: string }) => {
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

  return (
    <Snackbar
      open={notifications.length > 0}
      onClose={() => setNotifications([])}
      anchorOrigin={{ horizontal: 'center', vertical: 'top' }}
      sx={{ top: headerHeight }}
    >
      <Container sx={{ justifyContent: 'end', marginTop: 4 }}>
        {notifications.map(({ id, type, message }) => (
          <Alert key={id} variant="filled" severity={Severities[type]}>
            <AlertTitle>{Titles[type]}</AlertTitle>
            <Typography>{message}</Typography>
          </Alert>
        ))}
      </Container>
    </Snackbar>
  )
}
