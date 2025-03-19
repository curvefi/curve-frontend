import type { Components } from '@mui/material/styles'
import type { TypographyOptions } from '@mui/material/styles/createTypography'
import { handleBreakpoints } from './basic-theme'
import { getShadow } from './basic-theme/shadows'
import type { DesignSystem } from './design'

export const defineMuiTooltip = (design: DesignSystem, typography: TypographyOptions): Components['MuiTooltip'] => ({
  styleOverrides: {
    tooltip: {
      backgroundColor: design.Layer[3].Fill,
      boxShadow: getShadow(design, 2),
      minWidth: '27.5rem', // hardcoded 440px in the design
      display: 'flex',
      alignItems: 'center',
      padding: 0, // not according to the design, otherwise it breaks on inverted mode. See <TooltipContent />
      ...handleBreakpoints({
        ...typography.bodyMBold,
      }),
    },
  },
})
