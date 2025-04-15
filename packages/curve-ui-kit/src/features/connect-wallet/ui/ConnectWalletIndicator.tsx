import type { SetOptional } from 'type-fest'
import { useWallet } from '@ui-kit/features/connect-wallet'
import { ConnectedWalletLabel, ConnectedWalletLabelProps } from './ConnectedWalletLabel'
import { ConnectWalletButton, ConnectWalletButtonProps } from './ConnectWalletButton'

export type ConnectWalletIndicatorProps = SetOptional<ConnectWalletButtonProps, 'onConnectWallet'> &
  SetOptional<ConnectedWalletLabelProps, 'walletAddress' | 'onDisconnectWallet'>

export const ConnectWalletIndicator = ({
  walletAddress,
  label,
  // todo: get rid of these props after apps migrated
  onConnectWallet,
  onDisconnectWallet,
  ...props
}: ConnectWalletIndicatorProps) => {
  const { signerAddress, connect, disconnect } = useWallet()
  return signerAddress ? (
    <ConnectedWalletLabel
      walletAddress={walletAddress ?? signerAddress}
      onDisconnectWallet={onDisconnectWallet ?? disconnect}
      {...props}
    />
  ) : (
    <ConnectWalletButton label={label} onConnectWallet={onConnectWallet ?? connect} {...props} />
  )
}
