import '@mui/material/Card'

declare module '@mui/material/Card' {
  export type CardOwnProps = {
    size?: 'small' | 'inline'
  }
}
