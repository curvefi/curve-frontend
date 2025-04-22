import { useAccount } from 'wagmi'
import type { SxProps, Theme } from '@mui/material'
import { CONNECT_STAGE, isLoading, useConnection, useWallet } from '@ui-kit/features/connect-wallet'
import { ConnectedWalletLabel } from './ConnectedWalletLabel'
import { ConnectWalletButton } from './ConnectWalletButton'

export const ConnectWalletIndicator = ({ sx }: { sx?: SxProps<Theme> }) => {
  const { address } = useAccount()
  const { connect, disconnect } = useWallet()
  const { connectState } = useConnection()
  const loading = isLoading(connectState, CONNECT_STAGE.CONNECT_WALLET)
  return address ? (
    <ConnectedWalletLabel walletAddress={address} onClick={() => disconnect()} loading={loading} sx={sx} />
  ) : (
    <ConnectWalletButton onClick={() => connect()} loading={loading} sx={sx} />
  )
}
