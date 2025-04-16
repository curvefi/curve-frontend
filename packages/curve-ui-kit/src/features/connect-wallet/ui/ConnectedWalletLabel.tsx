import Button, { type ButtonProps } from '@mui/material/Button'
import { type Address, shortenAddress } from '@ui-kit/utils'

export type ConnectedWalletLabelProps = ButtonProps & {
  walletAddress: Address
}

export const ConnectedWalletLabel = ({ walletAddress, ...props }: ConnectedWalletLabelProps) => (
  <Button size="small" color="ghost" title={walletAddress} {...props}>
    {shortenAddress(walletAddress)}
  </Button>
)
