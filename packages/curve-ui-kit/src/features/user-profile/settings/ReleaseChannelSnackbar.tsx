import Alert from '@mui/material/Alert'
import AlertTitle from '@mui/material/AlertTitle'
import Snackbar, { SnackbarProps } from '@mui/material/Snackbar'
import { useReleaseChannel } from '@ui-kit/hooks/useLocalStorage'
import { t } from '@ui-kit/lib/i18n'
import { Duration } from '@ui-kit/themes/design/0_primitives'
import { ReleaseChannel } from '@ui-kit/utils'

export const ReleaseChannelSnackbar = ({
  open,
  onClose,
  channel,
  ...props
}: {
  open: boolean
  onClose: () => void
  channel: ReleaseChannel.Beta | ReleaseChannel.Legacy
} & Pick<SnackbarProps, 'anchorOrigin' | 'sx'>) => {
  const [releaseChannel] = useReleaseChannel()
  return (
    <Snackbar open={open} onClose={onClose} autoHideDuration={Duration.Snackbar} {...props}>
      <Alert variant="outlined" severity="success">
        <AlertTitle>
          {releaseChannel === ReleaseChannel.Stable ? t`${channel} Features Off` : t`${channel} Features On`}
        </AlertTitle>
        {t`You have successfully ${releaseChannel === ReleaseChannel.Stable ? 'disabled' : 'enabled'} ${channel.toLowerCase()} features.`}
      </Alert>
    </Snackbar>
  )
}
