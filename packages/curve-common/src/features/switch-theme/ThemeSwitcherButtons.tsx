import { FunctionComponent } from 'react'
import { themes, type ThemeSwitcherProps } from './types'
import IconButton from '@mui/material/IconButton'

export const ThemeSwitcherButtons: FunctionComponent<ThemeSwitcherProps> = ({ theme, onChange }) =>
  themes.map(({ type, Component }) => (
    <IconButton key={type} onClick={() => onChange(type)} className={theme === type ? 'current' : ''}>
      <Component size={18} />
    </IconButton>
  ))
