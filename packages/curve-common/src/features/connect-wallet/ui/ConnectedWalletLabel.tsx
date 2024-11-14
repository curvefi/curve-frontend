import { FunctionComponent } from 'react'
import Button from '@mui/material/Button'
import { Address, AddressLabel } from 'curve-ui-kit/src/shared/ui/AddressLabel'

import type { SxProps, Theme } from '@mui/system'

export type ConnectedWalletLabelProps = {
  walletAddress: Address,
  onDisconnectWallet: () => void
  disabled?: boolean
  sx?: SxProps<Theme>
}

export const ConnectedWalletLabel: FunctionComponent<ConnectedWalletLabelProps> = ({
  walletAddress,
  onDisconnectWallet,
  ...props
}) => (
  <Button variant="ghost" onClick={onDisconnectWallet} {...props}>
    <AddressLabel value={walletAddress} />
  </Button>
)
