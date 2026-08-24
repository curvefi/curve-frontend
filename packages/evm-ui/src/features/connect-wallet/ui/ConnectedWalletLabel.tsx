import { useEnsName } from 'wagmi'
import { shortenAddress } from '@evm-ui/utils/address'
import Button, { type ButtonProps } from '@mui/material/Button'
import type { Address } from '@primitives/address.utils'

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
