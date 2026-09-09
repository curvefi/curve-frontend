import type { WalletConnector } from '@/features/connect-wallet/stellar-wallet-kit'
import Box from '@mui/material/Box'
import { ConnectWalletModal } from '@ui/features/connect-wallet/ConnectWalletModal'
import { SizesAndSpaces } from '@ui/features/themes/design/1_sizes_spaces'
import { useWallet } from './useWallet'

const { IconSize } = SizesAndSpaces

const WalletIcon = ({ connector }: { connector: WalletConnector }) => (
  <Box component="img" src={connector.icon} alt={connector.name} sx={{ width: IconSize.xl, height: IconSize.xl }} />
)

export const StellarConnectModal = () => {
  const { connectors, connect, ...walletProps } = useWallet()
  const visibleConnectors = connectors.filter(connector => connector.isAvailable)
  return (
    <ConnectWalletModal
      visibleConnectors={visibleConnectors}
      onConnect={connect}
      {...walletProps}
      WalletIcon={WalletIcon}
    />
  )
}
