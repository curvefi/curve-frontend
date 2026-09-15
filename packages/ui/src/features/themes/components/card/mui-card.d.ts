/* eslint-disable @typescript-eslint/consistent-type-definitions */
import '@mui/material/Card'
import '@mui/material/Paper'

declare module '@mui/material/Card' {
  export interface CardOwnProps {
    size?: 'small'
  }
}

// Card inherits its variant prop from Paper.
declare module '@mui/material/Paper' {
  export interface PaperPropsVariantOverrides {
    inline: true
  }
}
