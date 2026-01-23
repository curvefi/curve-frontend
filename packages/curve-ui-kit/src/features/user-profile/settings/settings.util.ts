import { t } from '@ui-kit/lib/i18n'
import { ReleaseChannel } from '@ui-kit/utils'
import { showToast } from '@ui-kit/widgets/Toast/toast.util'

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
    id: `release-channel-${channel}`,
  })
