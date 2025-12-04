import { useWallet } from '@ui-kit/features/connect-wallet'
import { useWagmiConnection } from '@ui-kit/features/connect-wallet/lib/wagmi/hooks'
import type { SxProps } from '@ui-kit/utils'
import { ConnectedWalletLabel } from './ConnectedWalletLabel'
import { ConnectWalletButton } from './ConnectWalletButton'

export const ConnectWalletIndicator = ({ sx, onConnect }: { sx?: SxProps; onConnect?: () => void }) => {
  const { address, isConnecting } = useWagmiConnection()
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
