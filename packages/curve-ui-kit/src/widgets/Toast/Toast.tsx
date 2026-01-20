import { useEffect, useState } from 'react'
import Alert from '@mui/material/Alert'
import AlertTitle from '@mui/material/AlertTitle'
import Snackbar from '@mui/material/Snackbar'
import Stack from '@mui/material/Stack'
import { useLayoutStore } from '@ui-kit/features/layout'
import { Duration } from '@ui-kit/themes/design/0_primitives'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import { listenWalletNotifications, type ToastNotification } from './toast.util'

const { Spacing } = SizesAndSpaces

/** Get toast duration based on severity */
const getDuration = ({ severity = 'info' }: Pick<ToastNotification, 'severity'>) => Duration.Toast[severity]

/** Get total duration including transition */
const getTotalDuration = ({ severity }: Pick<ToastNotification, 'severity'>) =>
  getDuration({ severity }) + Duration.Transition

/** Get duration percent for keyframes */
const getDurationPercent = ({ severity }: Pick<ToastNotification, 'severity'>) =>
  `${(getDuration({ severity }) / getTotalDuration({ severity })) * 100}%`

export const Toast = () => {
  const [notifications, setNotifications] = useState<ToastNotification[]>([])
  const top = useLayoutStore((state) => state.navHeight)

  useEffect(() => {
    const timeouts: number[] = []
    const dismiss = (notification: ToastNotification): void => {
      setNotifications((prevNotifications: ToastNotification[]) => prevNotifications.filter((n) => n !== notification))
    }
    const add = (notification: ToastNotification): void => {
      setNotifications((prevNotifications: ToastNotification[]) => [...prevNotifications, notification])
      const timeout = window.setTimeout(() => dismiss(notification), getTotalDuration(notification))
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
      anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      sx={{ top, left: 'unset' }} // unset the left otherwise it will take the whole width
    >
      <Stack justifyContent="end" marginTop={Spacing.md} gap={Spacing.sm} flexWrap="wrap" flexDirection="row">
        {notifications.map(({ id, severity, title, message, testId }) => (
          <Alert
            key={id}
            variant="filled"
            severity={severity}
            data-testid={testId}
            sx={{
              // start to fade out after `getDuration` for `Duration.Transition` ms
              animation: `toastFadeOut ${getDuration({ severity }) + Duration.Transition}ms forwards`,
              '@keyframes toastFadeOut': { [getDurationPercent({ severity })]: { opacity: 1 }, '100%': { opacity: 0 } },
            }}
          >
            {title && <AlertTitle>{title}</AlertTitle>}
            {message}
          </Alert>
        ))}
      </Stack>
    </Snackbar>
  )
}
