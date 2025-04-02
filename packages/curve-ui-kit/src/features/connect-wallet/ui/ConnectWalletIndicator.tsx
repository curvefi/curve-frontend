import type { SetOptional } from 'type-fest'
import { useSwitch } from '@ui-kit/hooks/useSwitch'
import { useUseWagmi } from '../lib/hooks'
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
}: ConnectWalletIndicatorProps) => {
  const [isOpen, open, close] = useSwitch()
  const shouldUseWagmi = useUseWagmi()

  return (
    <>
      {walletAddress ? (
        <ConnectedWalletLabel walletAddress={walletAddress} onDisconnectWallet={onDisconnectWallet} {...props} />
      ) : (
        <ConnectWalletButton
          label={label}
          onConnectWallet={() => {
            if (shouldUseWagmi) {
              open()
            }
            onConnectWallet()
          }}
          {...props}
        />
      )}

      <WagmiConnectModal isOpen={!!isOpen} onClose={close} onConnected={close} />
    </>
  )
}
