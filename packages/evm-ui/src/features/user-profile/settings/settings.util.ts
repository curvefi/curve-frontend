import { t } from '@evm-ui/lib/i18n'
import { ReleaseChannel } from '@evm-ui/utils'
import { showToast } from '@evm-ui/widgets/Toast/toast.util'

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
