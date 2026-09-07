import type { ReactNode } from 'react'
import Button, { type ButtonProps } from '@mui/material/Button'
import { t } from '@ui/lib/i18n'

export type ConnectionProps = {
  isConnecting: boolean
  isConnected: boolean
  connect: () => Promise<void>
}

export type ConnectWalletButtonProps = Pick<ButtonProps, 'size' | 'fullWidth' | 'sx'> & {
  label?: ReactNode
  testId?: string
  onConnect?: () => void
} & ConnectionProps

export const ConnectWalletButton = ({
  label = t`Connect Wallet`,
  testId,
  onConnect,
  isConnecting,
  isConnected,
  connect,
  ...props
}: ConnectWalletButtonProps) => (
  <Button
    size="small"
    color="primary"
    type="button"
    data-testid={testId}
    loading={isConnecting}
    disabled={isConnected || isConnecting}
    onClick={() => {
      onConnect?.()
      void connect()
    }}
    {...props}
  >
    {label}
  </Button>
)
