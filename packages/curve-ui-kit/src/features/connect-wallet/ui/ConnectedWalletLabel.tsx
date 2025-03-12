import Button from '@mui/material/Button'
import type { SxProps, Theme } from '@mui/material/styles'
import { shortenAddress, type Address } from '@ui-kit/utils'

export type ConnectedWalletLabelProps = {
  walletAddress: Address
  onDisconnectWallet: () => void
  disabled?: boolean
  sx?: SxProps<Theme>
}

export const ConnectedWalletLabel = ({ walletAddress, onDisconnectWallet, ...props }: ConnectedWalletLabelProps) => (
  <Button size="small" color="ghost" onClick={onDisconnectWallet} title={walletAddress} {...props}>
    {shortenAddress(walletAddress)}
  </Button>
)
