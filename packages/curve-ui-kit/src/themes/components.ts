import { type ThemeOptions } from '@mui/material/styles'
import { defineMuiButton, defineMuiIconButton } from './button'
import { defineMuiTypography } from './typography'
import { defineMuiTab, defineMuiTabs } from './tabs'
import { DesignSystem } from './design'
import { SizesAndSpaces } from './design/1_sizes_spaces'

export const createComponents = (design: DesignSystem): ThemeOptions['components'] => ({
  MuiTypography: defineMuiTypography(),
  MuiButtonBase: {
    defaultProps: {
      disableRipple: true,
    },
  },
  MuiIconButton: defineMuiIconButton(design),
  MuiButton: defineMuiButton(design),
  MuiTab: defineMuiTab(),
  MuiTabs: defineMuiTabs(design),
  MuiToolbar: {
    styleOverrides: {
      root: { minHeight: SizesAndSpaces.ButtonSize.sm, paddingX: 3 },
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
        backgroundColor: design.Layer[1].Fill,
        border: `1px solid ${design.Color.Neutral[400]}`,
      },
      thumb: {
        borderRadius: 0,
        color: design.Color.Primary[500],
        '.Mui-checked &': { color: design.Color.Neutral[50] },
      },
    },
  },
})
