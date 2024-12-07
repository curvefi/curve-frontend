import { FunctionComponent } from 'react'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import { addressShort, type Address } from '@ui-kit/utils'

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
    <Box maxWidth={200} title={walletAddress}>
      {addressShort(walletAddress)}
    </Box>
  </Button>
)
