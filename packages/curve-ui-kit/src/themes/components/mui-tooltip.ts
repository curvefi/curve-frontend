import type { Components } from '@mui/material/styles'
import type { TypographyOptions } from '@mui/material/styles/createTypography'
import { Duration } from '@ui-kit/themes/design/0_primitives'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import { handleBreakpoints } from '../basic-theme'
import { getShadow } from '../basic-theme/shadows'
import type { DesignSystem } from '../design'

const { Spacing, MaxWidth } = SizesAndSpaces

export const defineMuiTooltip = (design: DesignSystem, typography: TypographyOptions): Components['MuiTooltip'] => ({
  defaultProps: {
    enterDelay: Duration.Tooltip.Enter,
    enterNextDelay: Duration.Tooltip.Enter,
    enterTouchDelay: Duration.Tooltip.Enter,
    leaveDelay: Duration.Tooltip.Exit,
    leaveTouchDelay: Duration.Tooltip.Exit,
  },
  styleOverrides: {
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
