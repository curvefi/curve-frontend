import { Duration } from '@evm-ui/themes/design/0_primitives'
import { SizesAndSpaces } from '@evm-ui/themes/design/1_sizes_spaces'
import type { Components, TypographyVariantsOptions } from '@mui/material/styles'
import { handleBreakpoints } from '../basic-theme'
import { getShadow } from '../basic-theme/shadows'
import type { DesignSystem } from '../design'

const { Spacing, MaxWidth } = SizesAndSpaces

export const defineMuiTooltip = (
  design: DesignSystem,
  typography: TypographyVariantsOptions,
): Components['MuiTooltip'] => ({
  defaultProps: {
    enterDelay: Duration.Tooltip.Enter,
    enterNextDelay: Duration.Tooltip.Enter,
    enterTouchDelay: Duration.Tooltip.Enter,
    leaveDelay: Duration.Tooltip.Exit,
    leaveTouchDelay: Duration.Tooltip.Exit,
    arrow: false,
  },
  styleOverrides: {
    arrow: {
      color: design.Layer[3].Fill,
      '&::before': {
        backgroundColor: design.Layer[3].Fill,
        boxShadow: getShadow(design, 2),
      },
    },
    tooltip: {
      color: design.Text.TextColors.Secondary,
      backgroundColor: design.Layer[3].Fill,
      boxShadow: getShadow(design, 2),
      maxWidth: MaxWidth.tooltip,
      display: 'flex',
      alignItems: 'center',
      ...handleBreakpoints({
        padding: Spacing.md,
        ...typography.bodyMBold,
      }),
    },
  },
})
