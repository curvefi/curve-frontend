import React, { FunctionComponent } from 'react'
import { ConnectWalletButton } from './ConnectWalletButton'
import { ConnectedWalletLabel } from './ConnectedWalletLabel'

export type ConnectWalletProps = {
  walletAddress?: string
  onConnectWallet: () => void
  onDisconnectWallet: () => void
}

export const ConnectWallet: FunctionComponent<ConnectWalletProps> = ({ walletAddress, onConnectWallet, onDisconnectWallet }) =>
  walletAddress ? (
    <ConnectedWalletLabel walletAddress={walletAddress} onDisconnectWallet={onDisconnectWallet} />
  ) : (
    <ConnectWalletButton onConnectWallet={onConnectWallet} />
  )
