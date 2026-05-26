/// <reference types="./mui-card.d.ts" />
import type { Components, TypographyVariantsOptions } from '@mui/material/styles'
import { DesignSystem } from '@ui-kit/themes/design'
import { cardContentInlineStyles, cardContentSmallStyles } from '../card-content'
import { cardHeaderInlineStyles, cardHeaderSmallStyles } from '../card-header'

export const defineMuiCard = (design: DesignSystem, typography: TypographyVariantsOptions): Components['MuiCard'] => ({
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
    {
      props: { size: 'inline' },
      style: {
        '& .MuiCardHeader-root': cardHeaderInlineStyles(design, typography),
        '& .MuiCardContent-root': cardContentInlineStyles,
      },
    },
  ],
})
