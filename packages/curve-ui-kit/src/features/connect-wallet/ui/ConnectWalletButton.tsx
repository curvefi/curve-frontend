import { type ReactNode } from 'react'
import { useConnection } from 'wagmi'
import Button, { type ButtonProps } from '@mui/material/Button'
import { t } from '@ui-kit/lib/i18n'
import { useWallet } from '../lib'

export const ConnectWalletButton = ({
  label = t`Connect Wallet`,
  testId = 'navigation-connect-wallet',
  onConnect,
  ...props
}: Pick<ButtonProps, 'size' | 'fullWidth' | 'sx'> & { label?: ReactNode; testId?: string; onConnect?: () => void }) => {
  const { isConnecting, isConnected } = useConnection()
  const { connect } = useWallet()
  return (
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
}
