import { type ThemeOptions } from '@mui/material/styles'
import type { TypographyOptions } from '@mui/material/styles/createTypography'
import { alpha } from '@mui/system'
import { basicMuiTheme } from './basic-theme'
import { getShadow } from './basic-theme/shadows'
import { defineMuiButton, defineMuiIconButton, defineMuiToggleButton } from './button'
import { defineMuiCardHeader } from './card-header'
import { defineMuiCheckbox } from './checkbox'
import { defineMuiChip } from './chip/mui-chip'
import { DesignSystem } from './design'
import { TransitionFunction } from './design/0_primitives'
import { SizesAndSpaces } from './design/1_sizes_spaces'
import { defineMuiAlert, defineMuiAlertTitle } from './mui-alert'
import { defineMuiMenuItem } from './mui-menu-item'
import { defineMuiSelect } from './mui-select'
import { defineMuiSwitch } from './mui-switch'
import { defineMuiTooltip } from './mui-tooltip'
import { defineMuiRadio } from './radio'
import { defineMuiSlider } from './slider'
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
  MuiCheckbox: defineMuiCheckbox(),
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
  MuiTooltip: defineMuiTooltip(design, typography),
  MuiPaper: {
    styleOverrides: {
      root: {
        boxShadow: getShadow(design, 1),
        // Disable elevation making the background color lighter in dark mode (default mui behavior)
        backgroundImage: 'none',
      },
      elevation2: { boxShadow: getShadow(design, 2) },
      elevation3: { boxShadow: getShadow(design, 3) },
      // mui does not support negative elevations, use 11 and 12 instead
      elevation11: { boxShadow: getShadow(design, -1) },
      elevation12: { boxShadow: getShadow(design, -2) },
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
  MuiRadio: defineMuiRadio(),
  MuiSwitch: defineMuiSwitch(design),
  MuiTypography: defineMuiTypography(design),
})
