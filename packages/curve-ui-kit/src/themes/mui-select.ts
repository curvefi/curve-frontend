import type { Components } from '@mui/material/styles'
import type { TypographyOptions } from '@mui/material/styles/createTypography'
import { DesignSystem } from '@ui-kit/themes/design'

export const defineMuiSelect = (design: DesignSystem, typography: TypographyOptions): Components['MuiSelect'] => ({
  styleOverrides: {
    root: {
      border: 'none',
      '& .MuiOutlinedInput-notchedOutline': {
        border: 'none',
        borderBottom: `1px solid ${design.Layer[3].Outline}`,
      },
      '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
        border: `2px solid ${design.Inputs.Base.Default.Border.Active}`,
      },
    },
    select: {
      ...typography.bodyMBold,
    },
  },
})
