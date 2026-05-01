/// <reference types="./mui-card.d.ts" />
import type { Components, TypographyVariantsOptions } from '@mui/material/styles'
import { cardContentSmallStyles } from '../card-content'
import { cardHeaderSmallStyles } from '../card-header'

export const defineMuiCard = (typography: TypographyVariantsOptions): Components['MuiCard'] => ({
  styleOverrides: {
    root: {
      backgroundColor: 'transparent', // We want the paper elevation only on the card content, not the header. Mui adds a bgColor by default.
      boxShadow: 'none',
    },
  },
  variants: [
    {
      props: { size: 'small' },
      style: {
        '& .MuiCardHeader-root': cardHeaderSmallStyles(typography),
        '& .MuiCardContent-root': cardContentSmallStyles,
      },
    },
  ],
})
