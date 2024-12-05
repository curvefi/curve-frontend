import { FunctionComponent } from 'react'
import { themes, type ThemeSwitcherProps } from './types'
import IconButton from '@mui/material/IconButton'

export const ThemeSwitcherButtons: FunctionComponent<ThemeSwitcherProps> = ({ theme, onChange }) =>
  themes.map(({ type, Component }) => (
    <IconButton size="small" key={type} onClick={() => onChange(type)} className={theme === type ? 'current' : ''} data-testid={`theme-switcher-button-${type}`}>
      <Component size={18} />
    </IconButton>
  ))
