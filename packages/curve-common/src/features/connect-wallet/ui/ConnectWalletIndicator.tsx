import React, { FunctionComponent } from 'react'
import { ConnectWalletButton } from './ConnectWalletButton'
import { ConnectedWalletLabel } from './ConnectedWalletLabel'
import { Address } from 'curve-ui-kit/src/shared/ui/AddressLabel'

export type ConnectWalletIndicatorProps = {
  walletAddress?: Address
  onConnectWallet: () => void
  onDisconnectWallet: () => void
  disabled?: boolean
}

export const ConnectWalletIndicator: FunctionComponent<ConnectWalletIndicatorProps> = ({ walletAddress, onConnectWallet, onDisconnectWallet, disabled }) =>
  walletAddress ? (
    <ConnectedWalletLabel walletAddress={walletAddress} onDisconnectWallet={onDisconnectWallet} disabled={disabled} />
  ) : (
    <ConnectWalletButton onConnectWallet={onConnectWallet} disabled={disabled} />
  )
