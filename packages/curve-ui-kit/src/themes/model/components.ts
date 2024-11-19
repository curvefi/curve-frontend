import { type ThemeOptions } from '@mui/material/styles'
import { BUTTONS_HEIGHTS, defineMuiButton, defineMuiIconButton } from '../../themes/button'
import { defineMuiTypography } from '../../themes/typography'
import type { ThemeKey } from '../basic-theme'
import { FIGMA_TOKENS } from './figma-tokens.generated'
import { defineMuiTabs } from '@ui-kit/themes/tabs'

export const DEFAULT_BAR_SIZE = BUTTONS_HEIGHTS[1] // medium

export const createComponents = (mode: ThemeKey): ThemeOptions['components'] => ({
  MuiTypography: defineMuiTypography(),
  MuiButtonBase: {
    defaultProps: {
      disableRipple: true,
    },
  },
  MuiIconButton: defineMuiIconButton(FIGMA_TOKENS, mode),
  MuiButton: defineMuiButton(FIGMA_TOKENS, mode),
  MuiTabs: defineMuiTabs(FIGMA_TOKENS, mode),
  MuiToolbar: {
    styleOverrides: {
      root: { minHeight: DEFAULT_BAR_SIZE, paddingX: 3 },
    },
  },
  MuiTab: {
    styleOverrides: {
      root: { textTransform: 'uppercase', minHeight: DEFAULT_BAR_SIZE },
    },
  },
  MuiContainer: {
    styleOverrides: { root: { display: 'flex', maxWidth: 'var(--width)' } },
  },
  MuiSwitch: {
    styleOverrides: {
      root: { padding: 0 },
      switchBase: { borderRadius: 0 },
      track: {
        borderRadius: 0,
        backgroundColor: 'transparent',
        border: `1px solid ${FIGMA_TOKENS.themes.desktop[mode].layer[1].outline}`,
      },
      thumb: { borderRadius: 0, backgroundColor: FIGMA_TOKENS.themes.desktop[mode].color.primary[500] },
      checked: {},
    },
  },
})
