import type { Components } from '@mui/material/styles'
import type { TypographyOptions } from '@mui/material/styles/createTypography'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import { handleBreakpoints } from './basic-theme'
import { getShadow } from './basic-theme/shadows'
import type { DesignSystem } from './design'

const { Spacing, MinWidth } = SizesAndSpaces

export const defineMuiTooltip = (design: DesignSystem, typography: TypographyOptions): Components['MuiTooltip'] => ({
  styleOverrides: {
    tooltip: {
      color: design.Text.TextColors.Secondary,
      backgroundColor: design.Layer[3].Fill,
      boxShadow: getShadow(design, 2),
      minWidth: MinWidth.tooltip,
      display: 'flex',
      alignItems: 'center',
      ...handleBreakpoints({
        padding: Spacing.md,
        ...typography.bodyMBold,
      }),
    },
  },
})
