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

/**
 * The Safe connector only works inside the Safe application, where the Curve app is loaded in an iframe.
 * Trying to use the Safe connector outside the iframe will result in an error.
 */
const isInIframe = typeof window !== 'undefined' && window !== window.parent

export const supportedWallets = [
  { label: `Browser Wallet`, icon: BrowserWalletIcon, connector: 'injected' },
  { label: `Wallet Connect`, icon: WalletConnectIcon, connector: 'walletConnect' },
  { label: `Coinbase`, icon: CoinbaseWalletIcon, connector: 'coinbaseWallet' },
  ...(isInIframe ? [{ label: 'Safe', icon: SafeWalletIcon, connector: 'safe' } as const] : []),
] satisfies WalletType[]
