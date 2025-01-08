import { type ThemeOptions } from '@mui/material/styles'
import { defineMuiButton, defineMuiIconButton } from './button'
import { defineMuiTypography } from './typography'
import { defineMuiTab, defineMuiTabs } from './tabs'
import { DesignSystem } from './design'
import { SizesAndSpaces } from './design/1_sizes_spaces'
import { defineMuiSwitch } from './mui-switch'
import { basicMuiTheme } from './basic-theme'
import { alpha } from '@mui/system'
import type { TypographyOptions } from '@mui/material/styles/createTypography'
import { definedMuiMenuItem } from '@ui-kit/themes/mui-menu-item'

export const DEFAULT_BAR_SIZE = SizesAndSpaces.ButtonSize.sm
export const MOBILE_SIDEBAR_WIDTH = { width: '100%', minWidth: 320 } as const

export const createComponents = (design: DesignSystem, typography: TypographyOptions): ThemeOptions['components'] => ({
  MuiButton: defineMuiButton(design),
  MuiButtonBase: {
    defaultProps: {
      disableRipple: true,
    },
  },
  MuiCardHeader: {
    styleOverrides: {
      root: {
        paddingBlock: SizesAndSpaces.Spacing.sm.desktop + ' 0',
        paddingInline: SizesAndSpaces.Spacing.md.desktop + ' 0',
        borderBottom: `1px solid ${design.Layer[3].Outline}`,
        minHeight: `calc(${SizesAndSpaces.ButtonSize.lg} + 1px)`, // 1px for the border
      },
      action: { alignContent: 'center', margin: 0 },
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
      paper: { maxHeight: '100dvh', [basicMuiTheme.breakpoints.down('tablet')]: { margin: 0 } },
    },
  },
  MuiFormControlLabel: {
    styleOverrides: {
      root: { margin: '0' }, // by default there is a negative margin 🤦
      label: { marginLeft: SizesAndSpaces.Spacing.xs.desktop, ...typography.headingXsBold },
    },
  },
  MuiIconButton: defineMuiIconButton(design),
  MuiInputBase: {
    styleOverrides: {
      root: {
        backgroundColor: design.Inputs.Base.Default.Fill,
        // color the whole input base when accepting autofill suggestions in Chromium browsers
        ':has(input:autofill)': {
          backgroundColor: 'light-dark(rgb(232, 240, 254), rgba(70, 90, 126, 0.4))',
          boxShadow: '0 0 0 100px #266798 inset',
          '& svg': { color: 'rgb(232, 240, 254)' },
        },
        '& .MuiOutlinedInput-notchedOutline': {
          borderWidth: 1,
        },
        '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
          borderColor: design.Inputs.Base.Default.Border.Active,
        },
        '&.Mui-error .MuiOutlinedInput-notchedOutline': {
          borderColor: design.Inputs.Base.Default.Border.Error,
        },
      },
      input: {
        height: SizesAndSpaces.ButtonSize.md,
        boxSizing: 'border-box',
      },
      inputSizeSmall: {
        height: SizesAndSpaces.ButtonSize.sm,
      },
    },
  },
  MuiMenuItem: definedMuiMenuItem(design),
  MuiSlider: {
    styleOverrides: {
      thumb: {
        borderRadius: 0,
      },
    },
  },
  MuiSkeleton: {
    styleOverrides: {
      root: {
        backgroundColor: alpha(design.Text.TextColors.Primary, 0.13),
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
  MuiPaper: {
    styleOverrides: {
      root: {
        boxShadow: [
          '0px 0px 0px 1px #2A334524',
          '0px 1px 1px -0.5px #2A334524',
          '0px 3px 3px -1.5px #2A334624',
          '0px 4px 4px -2px #2A334524',
          '0px 8px 8px -8px #2A334514',
        ].join(','),
        // Disable elevation making the background color lighter in dark mode (default mui behavior)
        backgroundImage: 'none',
      },
      elevation2: {
        boxShadow: [
          '0px 0px 0px 1px #2A334524',
          '0px 1px 1px -0.5px #2A334524',
          '0px 3px 3px -1.5px #2A334624',
          '0px 6px 6px -3px #2A334624',
          '0px 8px 8px -6px #2A334524',
          '0px 12px 12px -6px #2A334514',
        ].join(','),
      },
      elevation3: {
        boxShadow: [
          '0px 0px 0px 1px #2A334524',
          '0px 1px 1px -0.5px #2A334524',
          '0px 3px 3px -1.5px #2A334524',
          '0px 8px 8px -4px #2A334524',
          '0px 16px 16px -8px #2A334524',
          '0px 32px 32px -16px #2A33451A',
        ].join(','),
      },
      // this should actually be elevation -1 from our design system, but negative is not supported by mui
      elevation11: {
        boxShadow: `1px 1px 0px 0px ${design.Color.Neutral[800]} inset`,
      },
      // this should actually be elevation -2 from our design system, but negative is not supported by mui
      elevation12: {
        boxShadow: `2px 2px 0px 0px ${design.Color.Neutral[800]} inset`,
      },
    },
  },
  MuiPopover: {
    styleOverrides: {
      paper: {
        backgroundColor: design.Layer[3].Fill,
        '& .MuiMenu-list': {
          maxHeight: SizesAndSpaces.MaxHeight.popover,
        },
      },
    },
  },
  MuiSwitch: defineMuiSwitch(design),
  MuiTypography: defineMuiTypography(),
})
