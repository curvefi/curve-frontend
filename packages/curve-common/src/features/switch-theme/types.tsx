import { ChadImg, RCMoon, RCSun } from 'ui'
import Image from 'next/image'
import type { ThemeKey } from 'curve-ui-kit/src/shared/lib'

export const themes = [
  { type: 'light', Component: <RCSun aria-label="Light theme" /> },
  { type: 'dark', Component: <RCMoon aria-label="Dark theme" /> },
  { type: 'chad', Component: <Image width={24} src={ChadImg} alt="Fun theme" /> },
] as const

export type ThemeSwitcherProps = {
  theme: ThemeKey
  onChange(themeType: ThemeKey): void
  label: string
}
