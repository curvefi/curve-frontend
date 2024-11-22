import { type ThemeOptions } from '@mui/material/styles'
import { BUTTONS_HEIGHTS, defineMuiButton, defineMuiIconButton } from './button'
import { defineMuiTypography } from './typography'
import { defineMuiTab, defineMuiTabs } from './tabs'
import { Palette } from './palette'
import type { TypographyOptions } from '@mui/material/styles/createTypography'

export const DEFAULT_BAR_SIZE = BUTTONS_HEIGHTS[1] // medium

export const createComponents = (palette: Palette, typography: TypographyOptions): ThemeOptions['components'] => ({
  MuiTypography: defineMuiTypography(),
  MuiButtonBase: {
    defaultProps: {
      disableRipple: true,
    },
  },
  MuiIconButton: defineMuiIconButton(palette),
  MuiButton: defineMuiButton(palette, typography),
  MuiTab: defineMuiTab(),
  MuiTabs: defineMuiTabs(palette),
  MuiToolbar: {
    styleOverrides: {
      root: { minHeight: DEFAULT_BAR_SIZE, paddingX: 3 },
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
        backgroundColor: palette.background.layer1Fill,
        border: `1px solid ${palette.neutral[400]}`,
      },
      thumb: {
        borderRadius: 0,
        color: palette.primary.main,
        '.Mui-checked &': { color: palette.neutral[50] }
      },
    },
  },
})
