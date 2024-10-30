import { Button } from 'curve-ui-kit/src/shared/ui/Button'
import { t } from '@lingui/macro'

interface ConnectWalletButtonProps {
  onConnectWallet?: () => void
  disabled?: boolean
}

export const ConnectWalletButton = ({ onConnectWallet, disabled }: ConnectWalletButtonProps) =>
  <Button size="small" variant="contained" color="primary" onClick={onConnectWallet} disabled={disabled}>
    {t`Connect Wallet`}
  </Button>
