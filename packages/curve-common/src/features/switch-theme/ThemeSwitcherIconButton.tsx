import type { FunctionComponent } from 'react'
import type { Theme } from '@mui/system'
import IconButton from '@mui/material/IconButton'
import { ThemeSwitcherProps } from './types'
import { useThemeToggle } from './useThemeToggle'

export const ThemeSwitcherIconButton: FunctionComponent<ThemeSwitcherProps> = ({ theme, onChange }) => {
  const [ component, onClick ] = useThemeToggle({ theme, onChange })
  return (
   <IconButton onClick={onClick} sx={{minWidth: 38, fill: (t: Theme) => t.palette.primary.main}}>
     {component}
   </IconButton>
  )
}
