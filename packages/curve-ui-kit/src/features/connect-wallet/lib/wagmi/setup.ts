import { WALLET_CONNECT_PROJECT_ID } from '@ui-kit/features/connect-wallet/lib/utils/walletModules'
import { CoinbaseIcon } from '@ui-kit/shared/icons/CoinbaseIcon'
import { KeplrIcon } from '@ui-kit/shared/icons/KeplrIcon'
import { MetamaskIcon } from '@ui-kit/shared/icons/MetamaskIcon'
import { PhantomIcon } from '@ui-kit/shared/icons/PhantomIcon'
import { RabbyIcon } from '@ui-kit/shared/icons/RabbyIcon'
import { RainbowIcon } from '@ui-kit/shared/icons/RainbowIcon'
import { WalletIcon } from '@ui-kit/shared/icons/WalletIcon'
import { coinbaseWallet, injected, safe, walletConnect } from '@wagmi/connectors'
import { createConfig, http } from '@wagmi/core'
import { mainnet, sepolia } from '@wagmi/core/chains'

declare module 'wagmi' {
  // enables Wagmi to infer types in places that wouldn't normally have access to type info via React Context alone.
  interface Register {
    config: typeof config
  }
}

const Connectors = {
  [injected.type]: injected(),
  [coinbaseWallet.type]: coinbaseWallet(),
  [safe.type]: safe(),
  [walletConnect.type]: walletConnect({ projectId: WALLET_CONNECT_PROJECT_ID }),
}

export const SupportedWallets = [
  {
    label: `Rabby`,
    icon: RabbyIcon,
    connector: Connectors.injected,
  },
  {
    label: `Metamask`,
    icon: MetamaskIcon,
    connector: Connectors.injected,
  },
  {
    label: `Browser Plugin`,
    icon: WalletIcon,
    connector: Connectors.injected,
  },
  {
    label: `Phantom`,
    icon: PhantomIcon,
    connector: Connectors.injected,
  },
  {
    label: `Keplr`,
    icon: KeplrIcon,
    connector: Connectors.injected,
  },
  {
    label: `Rainbow`,
    icon: RainbowIcon,
    connector: Connectors.injected,
  },
  {
    label: `Coinbase`,
    icon: CoinbaseIcon,
    connector: Connectors.coinbaseWallet,
  },
]

export const config = createConfig({
  chains: [mainnet, sepolia],
  connectors: Object.values(Connectors),
  transports: {
    [mainnet.id]: http(),
    [sepolia.id]: http(),
  },
})
