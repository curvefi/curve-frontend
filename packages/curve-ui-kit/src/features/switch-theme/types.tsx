import { ChadImg, RCMoon, RCSun } from 'ui'
import Image from 'next/image'
import type { ThemeKey } from '@ui-kit/themes/basic-theme'

const DEFAULT_SIZE = 24
export const themes = [
  {
    type: 'light',
    Component: ({ size = DEFAULT_SIZE }: { size?: number }) => (
      <RCSun fill="currentColor" width={size} aria-label="Light theme" />
    ),
  },
  {
    type: 'dark',
    Component: ({ size = DEFAULT_SIZE }: { size?: number }) => (
      <RCMoon fill="currentColor" width={size} aria-label="Dark theme" />
    ),
  },
  {
    type: 'chad',
    Component: ({ size = DEFAULT_SIZE }: { size?: number }) => <Image width={size} src={ChadImg} alt="Fun theme" />,
  },
] as const

export type ThemeSwitcherProps = {
  theme: ThemeKey
  onChange(themeType: ThemeKey): void
  label: string
}
