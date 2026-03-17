import type { Components } from '@mui/material/styles'

export const defineMuiCard = (): Components['MuiCard'] => ({
  styleOverrides: {
    root: {
      backgroundColor: 'transparent', // we want the paper elevation only on the card content, not the header
      boxShadow: 'none',
    },
  },
})
