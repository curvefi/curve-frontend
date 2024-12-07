import { t } from '@lingui/macro'
import ToggleButton from '@mui/material/ToggleButton'
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup'

import { themes } from '@ui-kit/features/switch-theme/types'

import { Label, Setting } from '../Setting'
import useUserProfileStore from '../../store'

export const ThemeSelector = () => {
  const { theme, setTheme } = useUserProfileStore()

  return (
    <Setting>
      <Label>{t`Theme`}</Label>

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
