import { useAccount } from 'wagmi'
import { CONNECT_STAGE, isLoading, useConnection, useWallet } from '@ui-kit/features/connect-wallet'
import type { SxProps } from '@ui-kit/utils'
import { ConnectedWalletLabel } from './ConnectedWalletLabel'
import { ConnectWalletButton } from './ConnectWalletButton'

export const ConnectWalletIndicator = ({ sx, onConnect }: { sx?: SxProps; onConnect?: () => void }) => {
  const { address } = useAccount()
  const { connect, disconnect } = useWallet()
  const { connectState } = useConnection()
  const loading = isLoading(connectState, CONNECT_STAGE.CONNECT_WALLET)
  return address ? (
    <ConnectedWalletLabel address={address} onClick={() => disconnect()} loading={loading} sx={sx} />
  ) : (
    <ConnectWalletButton
      onClick={() => {
        onConnect?.()
        return connect()
      }}
      loading={loading}
      sx={sx}
    />
  )
}
