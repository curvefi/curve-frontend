import createSvgIcon from '@mui/material/utils/createSvgIcon'
import type { ConnectorType } from '@ui-kit/features/connect-wallet/lib/wagmi/connectors'
import { BrowserWalletIcon } from '@ui-kit/shared/icons/BrowserWalletIcon'
import { CoinbaseWalletIcon } from '@ui-kit/shared/icons/CoinbaseWalletIcon'
import { SafeWalletIcon } from '@ui-kit/shared/icons/SafeWalletIcon'
import { WalletConnectIcon } from '@ui-kit/shared/icons/WalletConnectIcon'

export type WalletType = {
  label: string
  icon: ReturnType<typeof createSvgIcon>
  connector: ConnectorType
}

export const supportedWallets = [
  { label: `Browser Wallet`, icon: BrowserWalletIcon, connector: 'injected' },
  { label: `Wallet Connect`, icon: WalletConnectIcon, connector: 'walletConnect' },
  { label: `Coinbase`, icon: CoinbaseWalletIcon, connector: 'coinbaseWallet' },
  { label: 'Safe', icon: SafeWalletIcon, connector: 'safe' },
] satisfies WalletType[]
