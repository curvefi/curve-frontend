import { type ThemeOptions } from '@mui/material/styles'
import type { TypographyOptions } from '@mui/material/styles/createTypography'
import { alpha } from '@mui/system'
import { basicMuiTheme } from './basic-theme'
import { defineMuiButton, defineMuiIconButton, defineMuiToggleButton } from './button'
import { defineMuiCardHeader } from './card-header'
import { defineMuiChip } from './chip/mui-chip'
import { DesignSystem } from './design'
import { TransitionFunction } from './design/0_primitives'
import { SizesAndSpaces } from './design/1_sizes_spaces'
import { defineMuiAlert, defineMuiAlertTitle } from './mui-alert'
import { defineMuiMenuItem } from './mui-menu-item'
import { defineMuiSelect } from './mui-select'
import { defineMuiSlider } from './mui-slider'
import { defineMuiSwitch } from './mui-switch'
import { defineMuiTab, defineMuiTabs } from './tabs'
import { defineMuiTypography } from './typography'

export const DEFAULT_BAR_SIZE = SizesAndSpaces.ButtonSize.sm
export const MOBILE_SIDEBAR_WIDTH = { width: '100%', minWidth: 320 } as const

export const createComponents = (design: DesignSystem, typography: TypographyOptions): ThemeOptions['components'] => ({
  MuiAlert: defineMuiAlert(design, typography),
  MuiAlertTitle: defineMuiAlertTitle(design, typography),
  MuiButton: defineMuiButton(design),
  MuiButtonBase: {
    defaultProps: {
      disableRipple: true,
    },
  },
  MuiCardHeader: defineMuiCardHeader(design, typography),
  MuiCardActions: {
    styleOverrides: {
      root: {
        borderTop: `1px solid ${design.Layer[3].Outline}`,
        minHeight: SizesAndSpaces.ButtonSize.lg,
        justifyContent: 'center',
      },
    },
  },
  MuiChip: defineMuiChip(design, typography),
  MuiContainer: {
    styleOverrides: { root: { display: 'flex', maxWidth: 'var(--width)' } },
  },
  MuiDialog: {
    styleOverrides: {
      paper: { maxHeight: '100dvh', [basicMuiTheme.breakpoints.down('tablet')]: { margin: 0 } },
    },
  },
  MuiDivider: {
    styleOverrides: {
      root: {
        borderColor: design.Layer[2].Outline,
      },
    },
  },
  MuiFormControlLabel: {
    styleOverrides: {
      root: { margin: '0' }, // by default there is a negative margin 🤦
      label: { marginLeft: SizesAndSpaces.Spacing.xs.desktop, ...typography.headingXsBold },
    },
  },
  MuiIconButton: defineMuiIconButton(design),
  MuiLinearProgress: {
    styleOverrides: {
      root: { backgroundColor: design.Color.Neutral[300] },
      bar: { backgroundColor: design.Color.Primary[500] },
    },
  },
  MuiToggleButton: defineMuiToggleButton(design),
  MuiToggleButtonGroup: {
    styleOverrides: {
      root: ({ ownerState }) => ({
        gap: ownerState.compact ? '0rem' : '0.25rem',
      }),
    },
  },
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
          transition: `border-color ${TransitionFunction}`,
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
  MuiMenuItem: defineMuiMenuItem(design),
  MuiSelect: defineMuiSelect(design, typography),
  MuiSlider: defineMuiSlider(design),
  MuiSkeleton: {
    styleOverrides: {
      root: {
        backgroundColor: alpha(design.Text.TextColors.Primary, 0.13),
      },
    },
  },
  MuiTab: defineMuiTab(design),
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
    defaultProps: {
      marginThreshold: 8, // allows the popover to be closer to the edge of the screen. Default is 16px
      elevation: 3,
    },
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
  MuiTypography: defineMuiTypography(design),
})
