import { type ReactNode } from 'react'
import { useConnection } from 'wagmi'
import { t } from '@evm-ui/lib/i18n'
import Button, { type ButtonProps } from '@mui/material/Button'
import { useWallet } from '../lib'

export const ConnectWalletButton = ({
  label = t`Connect Wallet`,
  testId,
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
