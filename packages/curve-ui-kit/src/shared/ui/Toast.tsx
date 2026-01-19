import React, { type ReactNode } from 'react'
import Alert, { type AlertProps } from '@mui/material/Alert'
import AlertTitle from '@mui/material/AlertTitle'
import Snackbar, { type SnackbarProps } from '@mui/material/Snackbar'
import { Duration } from '../../themes/design/0_primitives'

export type ToastProps = Omit<SnackbarProps, 'children'> &
  Pick<AlertProps, 'severity' | 'variant'> & {
    title?: ReactNode
    children?: ReactNode
  }

export const Toast = ({
  children,
  title,
  severity = 'success',
  variant = 'filled',
  autoHideDuration = Duration.Toast[severity],
  anchorOrigin = { vertical: 'top', horizontal: 'right' },
  ...props
}: ToastProps) => (
  <Snackbar anchorOrigin={anchorOrigin} autoHideDuration={autoHideDuration} {...props}>
    <Alert severity={severity} variant={variant} sx={{ width: '100%' }}>
      {title && <AlertTitle>{title}</AlertTitle>}
      {children}
    </Alert>
  </Snackbar>
)
