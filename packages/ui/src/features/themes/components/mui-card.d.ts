/* eslint-disable @typescript-eslint/consistent-type-definitions */
import '@mui/material/Card'
import '@mui/material/Paper'
import type { CardSize } from '../card-sizes'

declare module '@mui/material/Card' {
  export interface CardOwnProps {
    size?: CardSize
  }
}

// Card inherits its variant prop from Paper.
declare module '@mui/material/Paper' {
  export interface PaperPropsVariantOverrides {
    inline: true
  }
}
