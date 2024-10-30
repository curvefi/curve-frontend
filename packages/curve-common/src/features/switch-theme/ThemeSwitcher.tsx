import { ChadImg, RCMoon, RCSun } from 'ui'
import Image from 'next/image'
import type { FunctionComponent } from 'react'
import type { ThemeKey } from 'curve-ui-kit/src/shared/lib'
import type { Theme } from '@mui/system'
import IconButton from '@mui/material/IconButton'

const themes = [
  { type: 'light', Component: <RCSun aria-label="Light theme" /> },
  { type: 'dark', Component: <RCMoon aria-label="Dark theme" /> },
  { type: 'chad', Component: <Image width={24} src={ChadImg} alt="Fun theme" /> },
] as const

export type ThemeSwitcherProps = {
  theme: ThemeKey
  onChange(themeType: ThemeKey): void
}

export const ThemeSwitcher: FunctionComponent<ThemeSwitcherProps> = ({ theme, onChange }) => {
  const i = themes.findIndex((t) => t.type === theme)
  const themeIndex = i === -1 ? 0 : i
  const { Component } = themes[themeIndex]!
  const onClick = () => {
    const nextIndex = (themeIndex + 1) % themes.length
    onChange(themes[nextIndex].type)
  }
  return (
   <IconButton onClick={onClick} sx={{minWidth: 38, fill: (t: Theme) => t.palette.primary.main}}>
     {Component}
   </IconButton>
  )
}