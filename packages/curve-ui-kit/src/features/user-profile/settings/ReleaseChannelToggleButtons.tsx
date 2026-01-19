import { useState } from 'react'
import { objectKeys } from '@curvefi/prices-api/objects.util'
import ToggleButton from '@mui/material/ToggleButton'
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup'
import { useReleaseChannel } from '@ui-kit/hooks/useLocalStorage'
import { t } from '@ui-kit/lib/i18n'
import { ReleaseChannel } from '@ui-kit/utils'
import { ReleaseChannelDialog } from './ReleaseChannelDialog'
import { ReleaseChannelSnackbar } from './ReleaseChannelSnackbar'

export const ReleaseChannelToggleButtons = () => {
  const [releaseChannel] = useReleaseChannel()
  const [releaseChannelDialog, setReleaseChannelDialog] = useState<ReleaseChannel.Beta | ReleaseChannel.Legacy>()
  const [releaseChannelSnackbar, setReleaseChannelSnackbar] = useState<ReleaseChannel.Beta | ReleaseChannel.Legacy>()
  return (
    <>
      <ToggleButtonGroup
        value={releaseChannel}
        exclusive
        onChange={(_, newValue: ReleaseChannel) =>
          setReleaseChannelDialog(
            newValue === ReleaseChannel.Stable
              ? (releaseChannel as ReleaseChannel.Legacy | ReleaseChannel.Beta)
              : newValue,
          )
        }
        aria-label={t`Release channel selection`}
        size="small"
      >
        {objectKeys(ReleaseChannel).map((channel) => (
          <ToggleButton key={channel} value={channel} data-testid={`release-channel-button-${channel}`}>
            {t(channel)}
          </ToggleButton>
        ))}
      </ToggleButtonGroup>
      {releaseChannelDialog != null && (
        <ReleaseChannelDialog
          open
          onClose={() => setReleaseChannelDialog(undefined)}
          channel={releaseChannelDialog}
          onChanged={(newChannel) =>
            setReleaseChannelSnackbar(
              (newChannel === ReleaseChannel.Stable ? releaseChannel : newChannel) as
                | ReleaseChannel.Beta
                | ReleaseChannel.Legacy,
            )
          }
        />
      )}
      {releaseChannelSnackbar && (
        <ReleaseChannelSnackbar
          open
          onClose={() => setReleaseChannelSnackbar(undefined)}
          channel={releaseChannelSnackbar}
        />
      )}
    </>
  )
}
