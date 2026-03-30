import type { Components } from '@mui/material/styles'

export const defineMuiCard = (): Components['MuiCard'] => ({
  styleOverrides: {
    root: {
      backgroundColor: 'transparent', // We want the paper elevation only on the card content, not the header. Mui adds a bgColor by default.
      boxShadow: 'none',
    },
  },
})
