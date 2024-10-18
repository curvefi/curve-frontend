import { type ThemeOptions } from '@mui/material/styles'
import { figmaTokens } from '@/shared/api/figma-tokens'
import type { ThemeKey } from '@/shared/lib/basic-theme'
import { defineMuiButton } from '@/shared/ui/Button'
import { defineMuiCssBaseline } from '@/shared/ui/CssBaseline'
import { defineMuiTypography } from '@/shared/ui/Typography'

export const createComponents = (mode: ThemeKey) => {
  const components: ThemeOptions['components'] = {
    MuiTypography: defineMuiTypography(),
    MuiCssBaseline: defineMuiCssBaseline(),
    MuiButton: defineMuiButton(figmaTokens, mode),
  }

  return components
}
