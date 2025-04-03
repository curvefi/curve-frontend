import type { SetOptional } from 'type-fest'
import { ConnectedWalletLabel, ConnectedWalletLabelProps } from './ConnectedWalletLabel'
import { ConnectWalletButton, ConnectWalletButtonProps } from './ConnectWalletButton'
import { WagmiConnectModal } from './WagmiConnectModal'

export type ConnectWalletIndicatorProps = ConnectWalletButtonProps &
  SetOptional<ConnectedWalletLabelProps, 'walletAddress'>

export const ConnectWalletIndicator = ({
  walletAddress,
  label,
  onConnectWallet,
  onDisconnectWallet,
  ...props
}: ConnectWalletIndicatorProps) => (
  <>
    {walletAddress ? (
      <ConnectedWalletLabel walletAddress={walletAddress} onDisconnectWallet={onDisconnectWallet} {...props} />
    ) : (
      <ConnectWalletButton label={label} onConnectWallet={onConnectWallet} {...props} />
    )}
    {/* wagmi modal is here because this component is always rendered; however there are other buttons in the app! */}
    <WagmiConnectModal />
  </>
)
