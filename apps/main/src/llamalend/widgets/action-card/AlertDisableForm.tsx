import { ReactNode } from 'react'
import Alert from '@mui/material/Alert'
import AlertTitle from '@mui/material/AlertTitle'

export const AlertDisableForm = ({ children }: { children: ReactNode }) => (
  <Alert severity="error" data-testid={'alert-disable-form'}>
    <AlertTitle>{children}</AlertTitle>
  </Alert>
)
