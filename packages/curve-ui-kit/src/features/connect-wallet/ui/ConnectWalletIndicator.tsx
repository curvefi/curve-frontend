import type { SetOptional } from 'type-fest'
import { ConnectedWalletLabel, ConnectedWalletLabelProps } from './ConnectedWalletLabel'
import { ConnectWalletButton, ConnectWalletButtonProps } from './ConnectWalletButton'

export type ConnectWalletIndicatorProps = ConnectWalletButtonProps &
  SetOptional<ConnectedWalletLabelProps, 'walletAddress'>

export const ConnectWalletIndicator = ({
  walletAddress,
  label,
  onConnectWallet,
  onDisconnectWallet,
  ...props
}: ConnectWalletIndicatorProps) =>
  walletAddress ? (
    <ConnectedWalletLabel walletAddress={walletAddress} onDisconnectWallet={onDisconnectWallet} {...props} />
  ) : (
    <ConnectWalletButton label={label} onConnectWallet={onConnectWallet} {...props} />
  )
