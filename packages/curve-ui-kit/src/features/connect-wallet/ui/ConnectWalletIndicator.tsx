import { useConnection } from 'wagmi'
import type { SxProps } from '@ui-kit/utils/mui'
import { useWallet } from '../lib'
import { ConnectedWalletLabel } from './ConnectedWalletLabel'
import { ConnectWalletButton } from './ConnectWalletButton'

export const ConnectWalletIndicator = ({ sx, onConnect }: { sx?: SxProps; onConnect?: () => void }) => {
  const { address, isConnecting } = useConnection()
  const { disconnect } = useWallet()
  return address ? (
    <ConnectedWalletLabel address={address} onClick={() => disconnect()} loading={isConnecting} sx={sx} />
  ) : (
    <ConnectWalletButton onConnect={onConnect} sx={sx} testId="navigation-connect-wallet" />
  )
}
