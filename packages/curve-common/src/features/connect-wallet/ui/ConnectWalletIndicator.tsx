import React, { FunctionComponent } from 'react'
import { ConnectWalletButton, ConnectWalletButtonProps } from './ConnectWalletButton'
import { ConnectedWalletLabel, ConnectedWalletLabelProps } from './ConnectedWalletLabel'
import type { SetOptional } from 'type-fest'

export type ConnectWalletIndicatorProps = ConnectWalletButtonProps & SetOptional<ConnectedWalletLabelProps, 'walletAddress'>

export const ConnectWalletIndicator: FunctionComponent<ConnectWalletIndicatorProps> = ({ walletAddress, label, onConnectWallet, onDisconnectWallet, ...props }) =>
  walletAddress ? (
    <ConnectedWalletLabel walletAddress={walletAddress} onDisconnectWallet={onDisconnectWallet} {...props} />
  ) : (
    <ConnectWalletButton label={label} onConnectWallet={onConnectWallet} {...props} />
  )
