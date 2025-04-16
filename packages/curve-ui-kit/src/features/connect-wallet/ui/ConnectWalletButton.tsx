import Button, { type ButtonProps } from '@mui/material/Button'
import { t } from '@ui-kit/lib/i18n'

export const ConnectWalletButton = (props: ButtonProps) => (
  <Button size="small" color="primary" data-testid="navigation-connect-wallet" {...props}>
    {t`Connect Wallet`}
  </Button>
)
