import Button, { type ButtonProps } from '@mui/material/Button'
import type { Address } from '@primitives/address.utils'

export type ConnectedWalletLabelProps = ButtonProps & {
  address: Address
  addressLabel: string | undefined
}

export const ConnectedWalletLabel = ({ address, addressLabel, ...props }: ConnectedWalletLabelProps) => (
  <Button size="small" color="ghost" title={address} {...props}>
    {addressLabel}
  </Button>
)
