import { useEnsName } from 'wagmi'
import Button, { type ButtonProps } from '@mui/material/Button'
import type { Address } from '@primitives/address.utils'
import { shortenAddress } from '@ui-kit/utils'

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
