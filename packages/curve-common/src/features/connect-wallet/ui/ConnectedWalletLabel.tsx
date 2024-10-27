import { FunctionComponent } from 'react'
import { Button } from 'curve-ui-kit/src/shared/ui/Button'
import { AddressLabel } from 'curve-ui-kit/src/shared/ui/AddressLabel'

interface ConnectedWalletLabelProps {
  walletAddress: string,
  onDisconnectWallet: () => void
}

export const ConnectedWalletLabel: FunctionComponent<ConnectedWalletLabelProps> = ({
 walletAddress,
 onDisconnectWallet
}) => (
  <Button variant="ghost" color="primary" onClick={onDisconnectWallet}>
    <AddressLabel value={walletAddress} />
  </Button>
)
