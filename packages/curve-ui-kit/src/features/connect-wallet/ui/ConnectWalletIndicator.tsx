import type { SxProps, Theme } from '@mui/material'
import { CONNECT_STAGE, isLoading, useConnection, useWallet } from '@ui-kit/features/connect-wallet'
import { ConnectedWalletLabel } from './ConnectedWalletLabel'
import { ConnectWalletButton } from './ConnectWalletButton'

export const ConnectWalletIndicator = ({ sx, onConnect }: { sx?: SxProps<Theme>; onConnect?: () => void }) => {
  const { signerAddress, connect, disconnect, wallet } = useWallet()
  const { connectState } = useConnection()
  const loading = isLoading(connectState, CONNECT_STAGE.CONNECT_WALLET)
  return wallet && signerAddress ? (
    <ConnectedWalletLabel
      walletAddress={signerAddress}
      onClick={() => disconnect({ label: wallet.label })}
      loading={loading}
      sx={sx}
    />
  ) : (
    <ConnectWalletButton
      onClick={() => {
        onConnect?.()
        return connect()
      }}
      loading={loading}
      sx={sx}
    />
  )
}
