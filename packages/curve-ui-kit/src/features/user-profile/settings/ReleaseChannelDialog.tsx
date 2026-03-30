import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { showReleaseChannelSnackbar } from '@ui-kit/features/user-profile/settings/settings.util'
import { useReleaseChannel } from '@ui-kit/hooks/useLocalStorage'
import { t, Trans } from '@ui-kit/lib/i18n'
import { ModalDialog } from '@ui-kit/shared/ui/ModalDialog'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import { ReleaseChannel } from '@ui-kit/utils'

const { Spacing } = SizesAndSpaces

const Text = {
  [ReleaseChannel.Beta]: [
    t`Get early access to upcoming features and UI experiments before they go live.`,
    t`These are work-in-progress tools meant for testing, feedback, and iteration. You might experience minor bugs or visual inconsistencies — but your funds remain safe, and core functionality is unaffected.`,
    t`By enabling beta mode, you help shape the future of the Curve interface.`,
    t`You can turn this off at any time.`,
  ],
  [ReleaseChannel.Legacy]: [
    t`Legacy Mode gives you access to older features and designs that are being phased out.`,
    <Trans key="ReleaseChannelDialog.legacyWarning">
      Please note: Legacy Mode is <strong>not supported</strong> and will be <strong>retired soon</strong>. For the best
      experience, we recommend using the default or beta modes.
    </Trans>,
    t`You can turn this off at any time.`,
  ],
}

export const ReleaseChannelDialog = ({
  channel,
  open,
  onClose,
}: {
  channel: ReleaseChannel.Beta | ReleaseChannel.Legacy
  open: boolean
  onClose: () => void
}) => {
  const [releaseChannel, setReleaseChannel] = useReleaseChannel()
  const title = t`${releaseChannel === channel ? 'Disable' : 'Enable'} ${channel} Features`

  return (
    <ModalDialog
      compact
      open={open}
      onClose={onClose}
      title={title}
      footer={
        <Button
          color={releaseChannel === channel ? 'secondary' : 'primary'}
          onClick={() => {
            const newChannel = releaseChannel === channel ? ReleaseChannel.Stable : channel
            setReleaseChannel(newChannel)
            showReleaseChannelSnackbar({ channel, isEnabled: newChannel === channel })
            onClose()
          }}
          sx={{ width: '100%' }}
        >
          {title}
        </Button>
      }
    >
      <Stack gap={Spacing.md}>
        {Text[channel]?.map((p, i) => (
          <Typography color="textSecondary" key={i}>
            {p}
          </Typography>
        ))}
      </Stack>
    </ModalDialog>
  )
}
