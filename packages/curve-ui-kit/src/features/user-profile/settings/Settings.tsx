import Stack from '@mui/material/Stack'
import { ReleaseChannelToggleButtons } from '@ui-kit/features/user-profile/settings/ReleaseChannelToggleButtons'
import { t } from '@ui-kit/lib/i18n'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import { AdvancedModeSwitch } from './AdvancedModeSwitch'
import { HideSmallPoolsSwitch } from './HideSmallPoolsSwitch'
import { Setting, SettingLabel } from './Setting'
import { ThemeToggleButtons } from './ThemeToggleButtons'

const { Spacing } = SizesAndSpaces

export const Settings = () => (
  <Stack gap={Spacing.xs}>
    <Setting>
      <SettingLabel>{t`Theme`}</SettingLabel>
      <ThemeToggleButtons />
    </Setting>
    <Setting>
      <SettingLabel>{t`Release Channel`}</SettingLabel>
      <ReleaseChannelToggleButtons />
    </Setting>
    <Setting>
      <SettingLabel>{t`Advanced Mode`}</SettingLabel>
      <AdvancedModeSwitch />
    </Setting>
    <Setting>
      <SettingLabel>{t`Hide Small Pools`}</SettingLabel>
      <HideSmallPoolsSwitch />
    </Setting>
  </Stack>
)
