import { type ThemeOptions, type TypographyVariantsOptions } from '@mui/material/styles'
import { alpha } from '@mui/system'
import { defineMuiInputBase } from '@ui-kit/themes/components/mui-input-base'
import { basicMuiTheme } from '../basic-theme'
import { getShadow } from '../basic-theme/shadows'
import { DesignSystem } from '../design'
import { SizesAndSpaces } from '../design/1_sizes_spaces'
import { defineMuiButton, defineMuiIconButton, defineMuiToggleButton } from './button'
import { defineMuiCardHeader } from './card-header'
import { defineMuiCheckbox } from './checkbox'
import { defineMuiChip } from './chip'
import { defineMuiAlert, defineMuiAlertTitle } from './mui-alert'
import { defineMuiCard } from './mui-card'
import { defineMuiCardContent } from './mui-card-content'
import { defineMuiMenuItem } from './mui-menu-item'
import { defineMuiSelect } from './mui-select'
import { defineMuiSwitch } from './mui-switch'
import { defineMuiTooltip } from './mui-tooltip'
import { defineMuiRadio } from './radio'
import { defineMuiSlider } from './slider'
import { defineMuiTab, defineMuiTabs } from './tabs'
import { defineMuiTypography } from './typography'

export const DEFAULT_BAR_SIZE = SizesAndSpaces.ButtonSize.sm
export const MOBILE_SIDEBAR_WIDTH = { width: '100%', minWidth: 320, maxWidth: '100vw' } as const

export const createComponents = (
  design: DesignSystem,
  typography: TypographyVariantsOptions,
): ThemeOptions['components'] => ({
  MuiAlert: defineMuiAlert(design, typography),
  MuiAlertTitle: defineMuiAlertTitle(typography),
  MuiButton: defineMuiButton(design),
  MuiButtonBase: {
    defaultProps: {
      disableRipple: true,
    },
  },
  MuiCard: defineMuiCard(design),
  MuiCardContent: defineMuiCardContent(),
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
      label: {
        marginLeft: SizesAndSpaces.Spacing.xs.desktop,
        ...typography.headingXsBold,
      },
    },
  },
  MuiFormHelperText: {
    styleOverrides: {
      root: {
        margin: 0,
        paddingTop: SizesAndSpaces.Spacing.xs.desktop,
        color: design.Text.TextColors.Tertiary,
        ...typography.bodyXsRegular,
      },
    },
  },
  MuiFormLabel: {
    styleOverrides: {
      root: {
        marginBottom: SizesAndSpaces.Spacing.xs.desktop,
        color: design.Text.TextColors.Secondary,
        ...typography.bodyXsRegular,
      },
    },
  },
  MuiIconButton: defineMuiIconButton(design),
  MuiLinearProgress: {
    styleOverrides: {
      root: { backgroundColor: design.Color.Neutral[300] },
      bar: { backgroundColor: design.Color.Primary[500] },
    },
  },
  MuiLink: {
    styleOverrides: {
      root: {
        color: 'currentColor',
        '&:hover': {
          color: design.Button.Ghost.Default.Label,
          textDecoration: 'none',
        },
      },
    },
  },
  MuiToggleButton: defineMuiToggleButton(design),
  MuiToggleButtonGroup: {
    styleOverrides: { root: ({ ownerState }) => ({ columnGap: ownerState.compact ? '0rem' : '2px' }) },
  },
  MuiInputBase: defineMuiInputBase(design, typography),
  MuiInputLabel: {
    styleOverrides: {
      root: {
        '&.MuiInputLabel-sizeTiny:not(.MuiInputLabel-shrink)': {
          // the default in mui is 14px,16px but in extraSmall inputs it gets out of the box
          transform: 'translate(14px, 2px)',
        },
      },
    },
  },
  MuiMenuItem: defineMuiMenuItem(design),
  MuiSelect: defineMuiSelect(design),
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
  MuiTableRow: {
    styleOverrides: {
      root: {
        backgroundColor: design.Table.Row.Default,
        '&.Mui-selected': {
          backgroundColor: design.Table.Row.Selected,
        },
      },
      hover: { backgroundColor: design.Table.Row.Hover },
      head: { backgroundColor: design.Table.Header.Fill },
    },
  },
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
        backgroundColor: design.Layer[2].Fill,
        '& .MuiMenu-list': {
          maxHeight: SizesAndSpaces.MaxHeight.popover,
        },
      },
    },
  },
  MuiRadio: defineMuiRadio(),
  MuiSwitch: defineMuiSwitch(design),
  MuiDrawer: {
    styleOverrides: {
      paper: {
        backgroundColor: design.Layer[1].Fill,
        display: 'flex',
        flexDirection: 'column',
      },
    },
  },
  MuiTypography: defineMuiTypography(design),
})
