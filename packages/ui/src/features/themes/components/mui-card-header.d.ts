/* eslint-disable @typescript-eslint/consistent-type-definitions */
import '@mui/material/CardHeader'
import type { CardSize } from '../card-sizes'

declare module '@mui/material/CardHeader' {
  export interface CardHeaderOwnProps {
    size?: CardSize
    variant?: 'inline' | 'modal'
  }
}
