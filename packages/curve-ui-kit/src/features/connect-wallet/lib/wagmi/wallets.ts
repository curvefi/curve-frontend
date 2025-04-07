import createSvgIcon from '@mui/material/utils/createSvgIcon'
import type { ConnectorType } from '@ui-kit/features/connect-wallet/lib/wagmi/connectors'
import { CoinbaseWalletIcon } from '@ui-kit/shared/icons/CoinbaseWalletIcon'
import { FrameWalletIcon } from '@ui-kit/shared/icons/FrameWalletIcon'
import { InjectedWalletIcon } from '@ui-kit/shared/icons/InjectedWalletIcon'
import { KeplrWalletIcon } from '@ui-kit/shared/icons/KeplrWalletIcon'
import { MetamaskWalletIcon } from '@ui-kit/shared/icons/MetamaskWalletIcon'
import { OkxWalletIcon } from '@ui-kit/shared/icons/OkxWalletIcon'
import { PhantomWalletIcon } from '@ui-kit/shared/icons/PhantomWalletIcon'
import { RabbyWalletIcon } from '@ui-kit/shared/icons/RabbyWalletIcon'
import { RainbowWalletIcon } from '@ui-kit/shared/icons/RainbowWalletIcon'
import { TrustWalletIcon } from '@ui-kit/shared/icons/TrustWalletIcon'
import { WalletConnectIcon } from '@ui-kit/shared/icons/WalletConnectIcon'
import { ZerionWalletIcon } from '@ui-kit/shared/icons/ZerionWalletIcon'

export type WalletType = {
  label: string
  icon: ReturnType<typeof createSvgIcon> | string
  connector: ConnectorType
}

export const supportedWallets = [
  { label: `Rabby`, icon: RabbyWalletIcon, connector: 'injected' },
  { label: `Metamask`, icon: MetamaskWalletIcon, connector: 'injected' },
  { label: `Phantom`, icon: PhantomWalletIcon, connector: 'injected' },
  { label: `Keplr`, icon: KeplrWalletIcon, connector: 'injected' },
  { label: `Coinbase`, icon: CoinbaseWalletIcon, connector: 'coinbaseWallet' },
  { label: `WalletConnect`, icon: WalletConnectIcon, connector: 'walletConnect' },
  { label: 'TrustWallet', icon: TrustWalletIcon, connector: 'injected' },
  { label: 'Zerion', icon: ZerionWalletIcon, connector: 'injected' },
  { label: `Rainbow`, icon: RainbowWalletIcon, connector: 'injected' },
  { label: 'OKX', icon: OkxWalletIcon, connector: 'injected' },
  { label: 'Frame', icon: FrameWalletIcon, connector: 'injected' },
  { label: 'Injected', icon: InjectedWalletIcon, connector: 'injected' },
] satisfies WalletType[]
