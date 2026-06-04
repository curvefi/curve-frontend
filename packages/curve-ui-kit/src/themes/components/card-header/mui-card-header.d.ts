/* eslint-disable @typescript-eslint/consistent-type-definitions */
import '@mui/material/CardHeader'

declare module '@mui/material/CardHeader' {
  export interface CardHeaderOwnProps {
    size?: 'small' | 'inline'
  }
}
