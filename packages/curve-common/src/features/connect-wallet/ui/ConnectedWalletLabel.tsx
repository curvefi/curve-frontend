import { FunctionComponent } from 'react'
import { Button } from 'curve-ui-kit/src/shared/ui/Button'
import { Address, AddressLabel } from 'curve-ui-kit/src/shared/ui/AddressLabel'

interface ConnectedWalletLabelProps {
  walletAddress: Address,
  onDisconnectWallet: () => void
}

export const ConnectedWalletLabel: FunctionComponent<ConnectedWalletLabelProps> = ({
 walletAddress,
 onDisconnectWallet
}) => (
  <Button variant="ghost" onClick={onDisconnectWallet}>
    <AddressLabel value={walletAddress} />
  </Button>
)
