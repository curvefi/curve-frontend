import { type ThemeOptions } from '@mui/material/styles'
import { type ThemeKey } from '../basic-theme'
import { FIGMA_TOKENS } from './figma-tokens.generated'

export const createSpacing = (mode: ThemeKey): ThemeOptions => {
  const { xxs, xs, sm, md, lg, xl, xxl } = FIGMA_TOKENS.mappedSizesAndSpaces.desktop.spacing
  const theme = FIGMA_TOKENS.themes.desktop[mode]
  const spacing = [0, xxs, xs, sm, md, lg, xl, xxl]
  return {
    spacing,
    shape: {
      borderRadius: theme.radius.square,
    },
  }
}
