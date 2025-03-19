import type { Components } from '@mui/material/styles'
import type { TypographyOptions } from '@mui/material/styles/createTypography'
import { handleBreakpoints } from './basic-theme'
import { getShadow } from './basic-theme/shadows'
import type { DesignSystem } from './design'
import { SizesAndSpaces } from './design/1_sizes_spaces'

const { Spacing } = SizesAndSpaces

export const defineMuiTooltip = (design: DesignSystem, typography: TypographyOptions): Components['MuiTooltip'] => ({
  styleOverrides: {
    tooltip: {
      backgroundColor: design.Layer[3].Fill,
      boxShadow: getShadow(design, 2),
      width: '27.5rem', // hardcoded 440px in the design
      display: 'flex',
      alignItems: 'center',
      ...handleBreakpoints({
        padding: Spacing.md,
        ...typography.bodyMBold,
      }),
    },
  },
})
