import { type ThemeOptions } from '@mui/material/styles'
import { defineMuiButton, defineMuiIconButton } from './button'
import { defineMuiTypography } from './typography'
import { defineMuiTab, defineMuiTabs } from './tabs'
import { DesignSystem } from './design'
import { SizesAndSpaces } from './design/1_sizes_spaces'
import { defineMuiSwitch } from './mui-switch'
import { basicMuiTheme } from './basic-theme'

export const DEFAULT_BAR_SIZE = SizesAndSpaces.ButtonSize.sm

export const createComponents = (design: DesignSystem): ThemeOptions['components'] => ({
  MuiButton: defineMuiButton(design),
  MuiButtonBase: {
    defaultProps: {
      disableRipple: true,
    },
  },
  MuiCardHeader: {
    styleOverrides: {
      root: {
        padding: SizesAndSpaces.Spacing.sm.desktop + ' ' + SizesAndSpaces.Spacing.md.desktop,
        borderBottom: `1px solid ${design.Layer[3].Outline}`,
        minHeight: SizesAndSpaces.ButtonSize.lg,
      },
      action: { alignContent: 'center' },
    },
  },
  MuiCardActions: {
    styleOverrides: {
      root: {
        borderTop: `1px solid ${design.Layer[3].Outline}`,
        minHeight: SizesAndSpaces.ButtonSize.lg,
        justifyContent: 'center',
      },
    },
  },
  MuiContainer: {
    styleOverrides: { root: { display: 'flex', maxWidth: 'var(--width)' } },
  },
  MuiDialog: {
    styleOverrides: {
      paper: { [basicMuiTheme.breakpoints.down('tablet')]: { margin: SizesAndSpaces.Spacing.md.mobile } },
    },
  },
  MuiIconButton: defineMuiIconButton(design),
  MuiInputBase: {
    styleOverrides: {
      input: {
        height: SizesAndSpaces.ButtonSize.md,
        boxSizing: 'border-box',
      },
      inputSizeSmall: {
        height: SizesAndSpaces.ButtonSize.sm,
      },
    },
  },
  MuiTab: defineMuiTab(),
  MuiTabs: defineMuiTabs(design),
  MuiToolbar: {
    styleOverrides: {
      root: { minHeight: DEFAULT_BAR_SIZE, paddingX: 3 },
    },
  },
  MuiSwitch: defineMuiSwitch(design),
  MuiTypography: defineMuiTypography(),
})
