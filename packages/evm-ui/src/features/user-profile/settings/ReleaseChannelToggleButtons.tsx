import { useState } from 'react'
import { useReleaseChannel } from '@evm-ui/hooks/useLocalStorage'
import ToggleButton from '@mui/material/ToggleButton'
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup'
import { objectKeys } from '@primitives/objects.utils'
import { t } from '@ui/lib/i18n'
import { ReleaseChannel } from '@ui/utils/env'
import { ReleaseChannelDialog } from './ReleaseChannelDialog'

export const ReleaseChannelToggleButtons = () => {
  const [releaseChannel] = useReleaseChannel()
  const [releaseChannelDialog, setReleaseChannelDialog] = useState<ReleaseChannel.Beta | ReleaseChannel.Legacy>()
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
        {objectKeys(ReleaseChannel).map(channel => (
          <ToggleButton key={channel} value={channel} data-testid={`release-channel-button-${channel}`}>
            {t(channel)}
          </ToggleButton>
        ))}
      </ToggleButtonGroup>
      {releaseChannelDialog != null && (
        <ReleaseChannelDialog open onClose={() => setReleaseChannelDialog(undefined)} channel={releaseChannelDialog} />
      )}
    </>
  )
}
