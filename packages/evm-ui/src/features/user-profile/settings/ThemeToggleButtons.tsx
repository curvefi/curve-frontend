import ToggleButton from '@mui/material/ToggleButton'
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup'
import { t } from '@ui-kit/lib/i18n'
import { useUserProfileStore } from '../store'
import { themes } from './themes'

export const ThemeToggleButtons = () => {
  const theme = useUserProfileStore(state => state.theme)
  const setTheme = useUserProfileStore(state => state.setTheme)
  return (
    <ToggleButtonGroup
      value={theme}
      exclusive
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument -- Existing violation before enabling this rule.
      onChange={(_, value) => (value ? setTheme(value) : {})}
      aria-label={t`Theme selection`}
      size="smallSquare"
    >
      {themes.map(({ type, Component }) => (
        <ToggleButton key={type} value={type} data-testid={`theme-switch-button-${type}`}>
          <Component size={18} />
        </ToggleButton>
      ))}
    </ToggleButtonGroup>
  )
}
