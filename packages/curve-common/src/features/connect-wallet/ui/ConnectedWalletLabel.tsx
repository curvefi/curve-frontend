import { FunctionComponent } from 'react'
import { Button } from 'curve-ui-kit/src/shared/ui/Button'
import { Address, AddressLabel } from 'curve-ui-kit/src/shared/ui/AddressLabel'

interface ConnectedWalletLabelProps {
  walletAddress: Address,
  onDisconnectWallet: () => void
  disabled?: boolean
}

export const ConnectedWalletLabel: FunctionComponent<ConnectedWalletLabelProps> = ({
  walletAddress,
  onDisconnectWallet,
  disabled
}) => (
  <Button variant="ghost" onClick={onDisconnectWallet} disabled={disabled}>
    <AddressLabel value={walletAddress} />
  </Button>
)
