import Alert from '@mui/material/Alert'
import AlertTitle from '@mui/material/AlertTitle'
import Snackbar from '@mui/material/Snackbar'
import { useLayoutStore } from '@ui-kit/features/layout'
import { useReleaseChannel } from '@ui-kit/hooks/useLocalStorage'
import { t } from '@ui-kit/lib/i18n'
import { Duration } from '@ui-kit/themes/design/0_primitives'
import { ReleaseChannel } from '@ui-kit/utils'

export const ReleaseChannelSnackbar = ({
  open,
  onClose,
  channel,
}: {
  open: boolean
  onClose: () => void
  channel: ReleaseChannel.Beta | ReleaseChannel.Legacy
}) => {
  const navHeight = useLayoutStore((state) => state.navHeight)
  const [releaseChannel] = useReleaseChannel()
  return (
    <Snackbar
      open={open}
      onClose={onClose}
      autoHideDuration={Duration.Snackbar}
      anchorOrigin={{ horizontal: 'right', vertical: 'top' }}
      sx={{ top: navHeight, left: 'unset' }} // unset the left otherwise it will take the whole width
    >
      <Alert variant="outlined" severity="success">
        <AlertTitle>
          {releaseChannel === ReleaseChannel.Stable ? t`${channel} Features Off` : t`${channel} Features On`}
        </AlertTitle>
        {t`You have successfully ${releaseChannel === ReleaseChannel.Stable ? 'disabled' : 'enabled'} ${channel.toLowerCase()} features.`}
      </Alert>
    </Snackbar>
  )
}
