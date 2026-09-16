/* eslint-disable @typescript-eslint/consistent-type-definitions */
import '@mui/material/CardContent'
import type { CardSize } from '../card-sizes'

declare module '@mui/material/CardContent' {
  export interface CardContentOwnProps {
    size?: CardSize
  }
}
