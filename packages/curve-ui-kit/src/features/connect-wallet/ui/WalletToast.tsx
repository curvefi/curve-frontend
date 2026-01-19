import { useEffect, useState } from 'react'
import Alert from '@mui/material/Alert'
import AlertTitle from '@mui/material/AlertTitle'
import Container from '@mui/material/Container'
import Snackbar from '@mui/material/Snackbar'
import { useLayoutStore } from '@ui-kit/features/layout'
import { Duration } from '@ui-kit/themes/design/0_primitives'
import { listenWalletNotifications, type ToastNotification } from '../lib/notify'

export const WalletToast = () => {
  const [notifications, setNotifications] = useState<ToastNotification[]>([])
  const top = useLayoutStore((state) => state.navHeight)

  useEffect(() => {
    const timeouts: number[] = []
    const dismiss = (notification: ToastNotification): void => {
      setNotifications((prevNotifications: ToastNotification[]) => prevNotifications.filter((n) => n !== notification))
    }
    const add = (notification: ToastNotification): void => {
      setNotifications((prevNotifications: ToastNotification[]) => [...prevNotifications, notification])
      const timeout = window.setTimeout(() => dismiss(notification), Duration.Toast[notification.severity ?? 'info'])
      timeouts.push(timeout)
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
      anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      sx={{ top }}
    >
      <Container sx={{ justifyContent: 'end', marginTop: 4 }}>
        {notifications.map(({ id, severity, title, message, testId }) => (
          <Alert key={id} variant="filled" severity={severity} data-testid={testId}>
            {title && <AlertTitle>{title}</AlertTitle>}
            {message}
          </Alert>
        ))}
      </Container>
    </Snackbar>
  )
}
