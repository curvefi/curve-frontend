import { FunctionComponent } from 'react'
import Button from '@mui/material/Button'
import { Address, AddressLabel } from '@ui-kit/shared/ui/AddressLabel'

import type { SxProps, Theme } from '@mui/material/styles'

export type ConnectedWalletLabelProps = {
  walletAddress: Address
  onDisconnectWallet: () => void
  disabled?: boolean
  sx?: SxProps<Theme>
}

export const ConnectedWalletLabel: FunctionComponent<ConnectedWalletLabelProps> = ({
  walletAddress,
  onDisconnectWallet,
  ...props
}) => (
  <Button size="small" color="ghost" onClick={onDisconnectWallet} {...props}>
    <AddressLabel value={walletAddress} />
  </Button>
)
