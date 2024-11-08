import { FunctionComponent, useCallback } from 'react'
import type { Theme } from '@mui/system'
import IconButton from '@mui/material/IconButton'
import { themes, ThemeSwitcherProps } from './types'
import Tooltip from '@mui/material/Tooltip'

export const ThemeSwitcherButton: FunctionComponent<ThemeSwitcherProps> = ({ theme, onChange, label }) => {
  const i = themes.findIndex((t) => t.type === theme)
  const themeIndex = i === -1 ? 0 : i
  const onClick = useCallback(() => {
    const nextIndex = (themeIndex + 1) % themes.length
    onChange(themes[nextIndex].type)
  }, [themeIndex, onChange])
  const { Component } = themes[themeIndex]!
  return (
    <Tooltip title={label}>
     <IconButton onClick={onClick} sx={{ fill: (t: Theme) => t.palette.primary.main }}>
       <Component size={38} />
     </IconButton>
    </Tooltip>
  )
}
