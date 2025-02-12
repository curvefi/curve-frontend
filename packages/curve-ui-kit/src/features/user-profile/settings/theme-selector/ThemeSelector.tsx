import { t } from '@ui-kit/lib/i18n'
import ToggleButton from '@mui/material/ToggleButton'
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup'

import { themes } from '@ui-kit/features/switch-theme/types'

import { SettingLabel, Setting } from '../Setting'
import useUserProfileStore from '../../store'

export const ThemeSelector = () => {
  const theme = useUserProfileStore((state) => state.theme)
  const setTheme = useUserProfileStore((state) => state.setTheme)

  return (
    <Setting>
      <SettingLabel>{t`Theme`}</SettingLabel>

      <ToggleButtonGroup
        value={theme}
        exclusive
        onChange={(_, value) => (value ? setTheme(value) : {})}
        aria-label="theme selection"
      >
        {themes.map(({ type, Component }) => (
          <ToggleButton key={type} value={type}>
            <Component size={18} />
          </ToggleButton>
        ))}
      </ToggleButtonGroup>
    </Setting>
  )
}
