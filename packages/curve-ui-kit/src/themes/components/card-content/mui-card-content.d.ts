import '@mui/material/CardContent'

declare module '@mui/material/CardContent' {
  export type CardContentOwnProps = {
    size?: 'small' | 'inline'
  }
}
