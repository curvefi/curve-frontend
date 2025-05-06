import type { Components, TypographyVariantsOptions } from '@mui/material/styles'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import { handleBreakpoints } from '../basic-theme'
import { getShadow } from '../basic-theme/shadows'
import type { DesignSystem } from '../design'

const { Spacing, MaxWidth } = SizesAndSpaces

export const defineMuiTooltip = (
  design: DesignSystem,
  typography: TypographyVariantsOptions,
): Components['MuiTooltip'] => ({
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
