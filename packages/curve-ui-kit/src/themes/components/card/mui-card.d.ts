import '@mui/material/Card'

declare module '@mui/material/Card' {
  export interface CardOwnProps {
    size?: 'small'
  }
}
