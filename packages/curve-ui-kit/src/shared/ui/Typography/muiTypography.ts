import type { Components } from '@mui/material/styles'

export const defineMuiTypography = (): Components['MuiTypography'] => ({
  defaultProps: {
    variant: 'bodyMRegular',
    variantMapping: {
      bodyMBold: 'p',
      bodyMRegular: 'p',
      bodySBold: 'p',
      bodySRegular: 'p',
      bodyXsBold: 'p',
      bodyXsRegular: 'p',

      headingXxl: 'h1',
      headingMBold: 'h2',
      headingMLight: 'h3',
      headingSBold: 'h4',
      headingXsBold: 'h5',
      headingXsMedium: 'h6',
    },
  },
})
