import ToggleButton from '@mui/material/ToggleButton'
import ToggleButtonGroup, { ToggleButtonGroupProps } from '@mui/material/ToggleButtonGroup'
import { t } from '@ui-kit/lib/i18n'
import { useUserProfileStore } from '../store'
import { themes } from './themes'

export const ThemeToggleButtons = (props: Partial<ToggleButtonGroupProps>) => {
  const theme = useUserProfileStore((state) => state.theme)
  const setTheme = useUserProfileStore((state) => state.setTheme)
  return (
    <ToggleButtonGroup
      value={theme}
      exclusive
      onChange={(_, value) => (value ? setTheme(value) : {})}
      aria-label={t`Theme selection`}
      {...props}
    >
      {themes.map(({ type, Component }) => (
        <ToggleButton key={type} value={type} data-testid={`theme-switch-button-${type}`}>
          <Component size={18} />
        </ToggleButton>
      ))}
    </ToggleButtonGroup>
  )
}
