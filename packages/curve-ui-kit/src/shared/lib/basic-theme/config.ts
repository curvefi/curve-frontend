import { FontFamilyBasic, FontFamilyChad } from '../../ui/Typography'
import type { ThemeKey } from './theme.types'

export const ThemeFontFamily: Record<ThemeKey, typeof FontFamilyBasic | typeof FontFamilyChad> = {
  light: FontFamilyBasic,
  dark: FontFamilyBasic,
  chad: FontFamilyChad,
}
