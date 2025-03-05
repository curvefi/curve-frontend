import { ConnectWalletButton, ConnectWalletButtonProps } from './ConnectWalletButton'
import { ConnectedWalletLabel, ConnectedWalletLabelProps } from './ConnectedWalletLabel'
import type { SetOptional } from 'type-fest'

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
