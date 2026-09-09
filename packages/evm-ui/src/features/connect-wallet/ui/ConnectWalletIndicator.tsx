import type { Address } from '@primitives/address.utils'
import { ConnectWalletButton } from '@ui/components/ConnectWalletButton'
import type { SxProps } from '@ui/utils/mui'
import { ConnectedWalletLabel } from './ConnectedWalletLabel'

export type ConnectWalletProps = {
  disconnect: () => void
  address: Address | undefined
  addressLabel: string | undefined
  isConnecting: boolean
  isConnected: boolean
  connect: () => Promise<void>
}

export const ConnectWalletIndicator = ({
  sx,
  onConnect,
  disconnect,
  address,
  addressLabel,
  isConnecting,
  isConnected,
  connect,
}: { sx?: SxProps; onConnect?: () => void } & ConnectWalletProps) =>
  address ? (
    <ConnectedWalletLabel
      address={address}
      addressLabel={addressLabel}
      onClick={() => disconnect()}
      loading={isConnecting}
      sx={sx}
    />
  ) : (
    <ConnectWalletButton
      isConnecting={isConnecting}
      isConnected={isConnected}
      connect={connect}
      onConnect={onConnect}
      sx={sx}
      testId="navigation-connect-wallet"
    />
  )
