import { type ThemeOptions } from '@mui/material/styles'
import { figmaTokens } from '../../../shared/api/figma-tokens'
import type { ThemeKey } from '../../../shared/lib/basic-theme'
import { defineMuiButton } from '../../../shared/ui/Button'
import { defineMuiTypography } from '../../../shared/ui/Typography'

export const createComponents = (mode: ThemeKey): ThemeOptions['components'] => ({
  MuiTypography: defineMuiTypography(),
  MuiButton: defineMuiButton(figmaTokens, mode),
})
