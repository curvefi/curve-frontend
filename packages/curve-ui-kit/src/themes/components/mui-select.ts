import type { Components, TypographyVariantsOptions } from '@mui/material/styles'
import { DesignSystem } from '@ui-kit/themes/design'

export const defineMuiSelect = (
  design: DesignSystem,
  typography: TypographyVariantsOptions,
): Components['MuiSelect'] => ({
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
