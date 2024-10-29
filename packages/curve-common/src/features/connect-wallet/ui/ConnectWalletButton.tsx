import { Button } from '../../../../../curve-ui-kit/src/shared/ui/Button'
import { t } from '@lingui/macro'

interface ConnectWalletButtonProps {
  onConnectWallet?: () => void
}

export const ConnectWalletButton = ({ onConnectWallet }: ConnectWalletButtonProps) =>
  <Button size="small" variant="contained" color="primary" onClick={onConnectWallet}>{t`Connect Wallet`}</Button>
