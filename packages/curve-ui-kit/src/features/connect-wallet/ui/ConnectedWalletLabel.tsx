import Button from '@mui/material/Button'
import { addressShort, type Address } from '@ui-kit/utils'
import type { SxProps, Theme } from '@mui/material/styles'

export type ConnectedWalletLabelProps = {
  walletAddress: Address
  onDisconnectWallet: () => void
  disabled?: boolean
  sx?: SxProps<Theme>
}

export const ConnectedWalletLabel = ({ walletAddress, onDisconnectWallet, ...props }: ConnectedWalletLabelProps) => (
  <Button size="small" color="ghost" onClick={onDisconnectWallet} title={walletAddress} {...props}>
    {addressShort(walletAddress)}
  </Button>
)
