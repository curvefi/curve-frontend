import { themes, ThemeSwitcherProps } from './types'
import { useCallback } from 'react'

export function useThemeToggle({theme, onChange}: ThemeSwitcherProps) {
  const i = themes.findIndex((t) => t.type === theme)
  const themeIndex = i === -1 ? 0 : i
  const onClick = useCallback(() => {
    const nextIndex = (themeIndex + 1) % themes.length
    onChange(themes[nextIndex].type)
  }, [themeIndex, onChange])
  return [ themes[themeIndex]!.Component, onClick ] as const
}
