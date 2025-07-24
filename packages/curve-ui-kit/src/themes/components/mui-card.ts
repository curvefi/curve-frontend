import type { Components } from '@mui/material/styles'
import { DesignSystem } from '@ui-kit/themes/design'

export const defineMuiCard = (design: DesignSystem): Components['MuiCard'] => ({
  styleOverrides: {
    root: {
      backgroundColor: design.Layer[1].Fill,
      boxShadow: 'none',
    },
  },
})
