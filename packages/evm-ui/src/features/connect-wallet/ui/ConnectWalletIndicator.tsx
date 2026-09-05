import { useConnection } from 'wagmi'
import type { SxProps } from '@ui/utils/mui'
import { useWallet } from '../lib'
import { ConnectedWalletLabel } from './ConnectedWalletLabel'
import { ConnectEvmWalletButton } from './ConnectEvmWalletButton'

export const ConnectWalletIndicator = ({ sx, onConnect }: { sx?: SxProps; onConnect?: () => void }) => {
  const { address, isConnecting } = useConnection()
  const { disconnect } = useWallet()
  return address ? (
    <ConnectedWalletLabel address={address} onClick={() => disconnect()} loading={isConnecting} sx={sx} />
  ) : (
    <ConnectEvmWalletButton onConnect={onConnect} sx={sx} testId="navigation-connect-wallet" />
  )
}
