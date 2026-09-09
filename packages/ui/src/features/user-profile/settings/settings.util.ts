import { showToast } from '@ui/features/toast/Toast/toast.util'
import { ReleaseChannel } from '@ui/lib/env'
import { t } from '@ui/lib/i18n'

export const showReleaseChannelSnackbar = ({
  channel,
  isEnabled,
}: {
  channel: ReleaseChannel.Beta | ReleaseChannel.Legacy
  isEnabled: boolean
}) =>
  showToast({
    title: t`${channel} Features ${isEnabled ? 'On' : 'Off'}`,
    message: t`You have successfully ${isEnabled ? 'enabled' : 'disabled'} ${channel.toLowerCase()} features.`,
    severity: 'info',
  })
