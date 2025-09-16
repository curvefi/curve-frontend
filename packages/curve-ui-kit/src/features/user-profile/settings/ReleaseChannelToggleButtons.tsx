import { objectKeys } from '@curvefi/prices-api/objects.util'
import ToggleButton from '@mui/material/ToggleButton'
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup'
import { useReleaseChannel } from '@ui-kit/hooks/useLocalStorage'
import { t } from '@ui-kit/lib/i18n'
import { ReleaseChannel } from '@ui-kit/utils'

export const ReleaseChannelToggleButtons = () => {
  const [releaseChannel, setReleaseChannel] = useReleaseChannel()
  return (
    <ToggleButtonGroup
      value={releaseChannel}
      exclusive
      onChange={(_, value) => (value ? setReleaseChannel(value) : {})}
      aria-label={t`Release channel selection`}
      size="small"
      compact
    >
      {objectKeys(ReleaseChannel).map((channel) => (
        <ToggleButton key={channel} value={channel} data-testid={`release-channel-button-${channel}`}>
          {t(channel)}
        </ToggleButton>
      ))}
    </ToggleButtonGroup>
  )
}
