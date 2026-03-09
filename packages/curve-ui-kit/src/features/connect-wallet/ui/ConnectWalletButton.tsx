import Button, { type ButtonProps } from '@mui/material/Button'
import { t } from '@ui-kit/lib/i18n'

export const ConnectWalletButton = ({ label = t`Connect Wallet`, ...props }: ButtonProps & { label?: string }) => (
  <Button size="small" color="primary" data-testid="navigation-connect-wallet" {...props}>
    {label}
  </Button>
)
