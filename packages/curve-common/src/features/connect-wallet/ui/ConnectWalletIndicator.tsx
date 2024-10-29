import React, { FunctionComponent } from 'react'
import { ConnectWalletButton } from './ConnectWalletButton'
import { ConnectedWalletLabel } from './ConnectedWalletLabel'
import { Address } from 'curve-ui-kit/src/shared/ui/AddressLabel'

export type ConnectWalletIndicatorProps = {
  walletAddress?: Address
  onConnectWallet: () => void
  onDisconnectWallet: () => void
}

export const ConnectWalletIndicator: FunctionComponent<ConnectWalletIndicatorProps> = ({ walletAddress, onConnectWallet, onDisconnectWallet }) =>
  walletAddress ? (
    <ConnectedWalletLabel walletAddress={walletAddress} onDisconnectWallet={onDisconnectWallet} />
  ) : (
    <ConnectWalletButton onConnectWallet={onConnectWallet} />
  )
