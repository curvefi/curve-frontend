import { useReleaseChannel } from '@ui-kit/hooks/useLocalStorage'
import { t } from '@ui-kit/lib/i18n'
import { ReleaseChannel } from '@ui-kit/utils'
import { Toast, type ToastProps } from '../../../shared/ui/Toast'

export const ReleaseChannelSnackbar = ({
  channel,
  ...props
}: {
  channel: ReleaseChannel.Beta | ReleaseChannel.Legacy
} & Omit<ToastProps, 'children'>) => {
  const [currentChannel] = useReleaseChannel()
  return (
    <Toast
      variant="outlined"
      title={currentChannel === ReleaseChannel.Stable ? t`${channel} Features Off` : t`${channel} Features On`}
      {...props}
    >
      {t`You have successfully ${currentChannel === ReleaseChannel.Stable ? 'disabled' : 'enabled'} ${channel.toLowerCase()} features.`}
    </Toast>
  )
}
