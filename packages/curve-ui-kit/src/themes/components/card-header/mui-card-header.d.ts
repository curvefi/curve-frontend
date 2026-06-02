import '@mui/material/CardHeader'

declare module '@mui/material/CardHeader' {
  export type CardHeaderOwnProps = {
    size?: 'small' | 'inline'
  }
}
