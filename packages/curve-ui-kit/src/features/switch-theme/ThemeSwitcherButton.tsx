import { useCallback } from 'react'
import IconButton from '@mui/material/IconButton'
import Tooltip from '@mui/material/Tooltip'
import { themes, ThemeSwitcherProps } from './types'

export const ThemeSwitcherButton = ({ theme, onChange, label }: ThemeSwitcherProps) => {
  const i = themes.findIndex((t) => t.type === theme)
  const themeIndex = i === -1 ? 0 : i
  const onClick = useCallback(() => {
    const nextIndex = (themeIndex + 1) % themes.length
    onChange(themes[nextIndex].type)
  }, [themeIndex, onChange])

  const { Component } = themes[themeIndex]!
  return (
    <Tooltip title={label}>
      <IconButton size="small" onClick={onClick} sx={{ padding: 2 }} data-testid={`theme-switcher-${theme}`}>
        <Component size={28} />
      </IconButton>
    </Tooltip>
  )
}
