import React, { type ReactNode } from 'react'
import Alert, { type AlertProps } from '@mui/material/Alert'
import AlertTitle from '@mui/material/AlertTitle'
import Snackbar, { type SnackbarProps } from '@mui/material/Snackbar'
import { useLayoutStore } from '@ui-kit/features/layout'
import { Duration } from '../../themes/design/0_primitives'

export type ToastProps = Omit<SnackbarProps, 'children' | 'sx'> &
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
}: ToastProps) => {
  const top = useLayoutStore((state) => state.navHeight)
  return (
    <Snackbar
      anchorOrigin={anchorOrigin}
      autoHideDuration={autoHideDuration}
      sx={{ top, left: 'unset' }} // unset the left otherwise it will take the whole width
      {...props}
    >
      <Alert severity={severity} variant={variant} sx={{ width: '100%' }}>
        {title && <AlertTitle>{title}</AlertTitle>}
        {children}
      </Alert>
    </Snackbar>
  )
}
