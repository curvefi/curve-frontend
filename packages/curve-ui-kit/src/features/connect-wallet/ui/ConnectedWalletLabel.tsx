import Button, { type ButtonProps } from '@mui/material/Button'
import { useEnsName } from '@ui-kit/features/connect-wallet/lib/wagmi/hooks'
import { type Address, shortenAddress } from '@ui-kit/utils'

export type ConnectedWalletLabelProps = ButtonProps & {
  address: Address
}

export const ConnectedWalletLabel = ({ address, ...props }: ConnectedWalletLabelProps) => {
  const { data: ensName } = useEnsName({ address })
  return (
    <Button size="small" color="ghost" title={address} {...props}>
      {ensName || shortenAddress(address)}
    </Button>
  )
}
