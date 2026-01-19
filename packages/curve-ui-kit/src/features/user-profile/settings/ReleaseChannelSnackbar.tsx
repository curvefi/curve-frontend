import { showToast } from '@ui-kit/features/connect-wallet/lib/notify'
import { t } from '@ui-kit/lib/i18n'
import { ReleaseChannel } from '@ui-kit/utils'

export function showReleaseChannelSnackbar(
  currentChannel: ReleaseChannel,
  channel: ReleaseChannel.Beta | ReleaseChannel.Legacy,
) {
  const title = currentChannel === ReleaseChannel.Stable ? t`${channel} Features Off` : t`${channel} Features On`
  const message = t`You have successfully ${currentChannel === ReleaseChannel.Stable ? 'disabled' : 'enabled'} ${channel.toLowerCase()} features.`
  return showToast({ title, message, severity: 'info', id: `release-channel-${channel}` })
}
