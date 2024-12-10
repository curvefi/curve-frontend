import { FunctionComponent, useCallback, useEffect } from 'react'
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

  useEffect(() => {
    if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
      const timer = setInterval(onClick, 3000)
      return () => clearTimeout(timer)
    }
  }, [onClick])

  const { Component } = themes[themeIndex]!
  return (
    <Tooltip title={label}>
      <IconButton size="small" onClick={onClick} sx={{ padding: 2 }} data-testid={`theme-switcher-${theme}`}>
        <Component size={28} />
      </IconButton>
    </Tooltip>
  )
}
