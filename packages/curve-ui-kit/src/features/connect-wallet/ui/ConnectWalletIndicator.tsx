import { useConnection } from 'wagmi'
import { useWallet } from '@ui-kit/features/connect-wallet'
import type { SxProps } from '@ui-kit/utils'
import { ConnectedWalletLabel } from './ConnectedWalletLabel'
import { ConnectWalletButton } from './ConnectWalletButton'

export const ConnectWalletIndicator = ({ sx, onConnect }: { sx?: SxProps; onConnect?: () => void }) => {
  const { address, isConnecting } = useConnection()
  const { connect, disconnect } = useWallet()
  return address ? (
    <ConnectedWalletLabel address={address} onClick={() => disconnect()} loading={isConnecting} sx={sx} />
  ) : (
    <ConnectWalletButton
      onClick={() => {
        onConnect?.()
        return connect()
      }}
      loading={isConnecting}
      sx={sx}
    />
  )
}
