import type { ReactNode } from 'react'
import Button from '@mui/material/Button'

/** Button wrapper for clickable balance text */
export const BalanceButton = ({
  children,
  onClick,
  loading,
  disabled,
  testId,
}: {
  children: ReactNode
  onClick?: () => void
  loading?: boolean
  disabled?: boolean
  testId?: string
}) => (
  <Button
    variant="inline"
    color="ghost"
    size="extraSmall"
    onClick={onClick}
    loading={loading}
    disabled={disabled}
    data-testid={testId}
    sx={{ '&:hover .balance': { textDecoration: 'underline' } }}
  >
    {children}
  </Button>
)
