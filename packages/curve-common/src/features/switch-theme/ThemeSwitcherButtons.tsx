import { FunctionComponent } from 'react'
import type { Theme } from '@mui/system'
import { themes, type ThemeSwitcherProps } from './types'
import IconButton from '@mui/material/IconButton'
import Box from '@mui/material/Box'

export const ThemeSwitcherButtons: FunctionComponent<ThemeSwitcherProps> = ({ theme, onChange }) =>
  themes.map(({ type, Component }) => (
    <IconButton
      key={type}
      onClick={() => onChange(type)}
      sx={{
        fill: (t: Theme) => theme === type ? t.palette.primary.main : t.palette.text.secondary,
        backgroundColor: (t: Theme) => theme === type ? t.palette.primary.contrastText : 'transparent',
        borderRadius: 0, // todo: change radius in theme
      }}>
      <Component size={18} />
    </IconButton>
  ))
