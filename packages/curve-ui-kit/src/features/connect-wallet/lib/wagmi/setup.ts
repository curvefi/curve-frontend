import createSvgIcon from '@mui/material/utils/createSvgIcon'
import { WALLET_CONNECT_PROJECT_ID } from '@ui-kit/features/connect-wallet/lib/utils/walletModules'
import { CoinbaseIcon } from '@ui-kit/shared/icons/CoinbaseIcon'
import { KeplrIcon } from '@ui-kit/shared/icons/KeplrIcon'
import { MetamaskIcon } from '@ui-kit/shared/icons/MetamaskIcon'
import { PhantomIcon } from '@ui-kit/shared/icons/PhantomIcon'
import { RabbyIcon } from '@ui-kit/shared/icons/RabbyIcon'
import { RainbowIcon } from '@ui-kit/shared/icons/RainbowIcon'
import { WalletConnectIcon } from '@ui-kit/shared/icons/WalletConnectIcon'
import { WalletIcon } from '@ui-kit/shared/icons/WalletIcon'
import { coinbaseWallet, injected, safe, walletConnect } from '@wagmi/connectors'
import { createConfig, http } from '@wagmi/core'
import { mainnet, sepolia } from '@wagmi/core/chains'

declare module 'wagmi' {
  // noinspection JSUnusedGlobalSymbols
  /**
   * Enable Wagmi to infer types in places that wouldn't normally have access to type info via React Context alone.
   */
  interface Register {
    config: typeof config
  }
}

export const Connectors = {
  [injected.type]: injected(),
  [coinbaseWallet.type]: coinbaseWallet(),
  [safe.type]: safe() as ReturnType<typeof safe>,
  [walletConnect.type]: walletConnect({ projectId: WALLET_CONNECT_PROJECT_ID }),
}

type ConnectorType = keyof typeof Connectors

export type WalletType = {
  label: string
  icon: ReturnType<typeof createSvgIcon>
  connector: ConnectorType
}

export const SupportedWallets = [
  {
    label: `Rabby`,
    icon: RabbyIcon,
    connector: 'injected',
  },
  {
    label: `Metamask`,
    icon: MetamaskIcon,
    connector: 'injected',
  },
  {
    label: `Phantom`,
    icon: PhantomIcon,
    connector: 'injected',
  },
  {
    label: `Keplr`,
    icon: KeplrIcon,
    connector: 'injected',
  },
  {
    label: `Rainbow`,
    icon: RainbowIcon,
    connector: 'injected',
  },
  {
    label: `Coinbase`,
    icon: CoinbaseIcon,
    connector: 'coinbaseWallet',
  },
  {
    label: `WalletConnect`,
    icon: WalletConnectIcon,
    connector: 'walletConnect',
  },
  {
    label: `Browser`,
    icon: WalletIcon,
    connector: 'injected',
  },
] satisfies WalletType[]

export const config = createConfig({
  chains: [mainnet, sepolia],
  // todo: get rid of this any
  connectors: Object.values(Connectors) as any,
  transports: {
    [mainnet.id]: http(),
    [sepolia.id]: http(),
  },
})

export type WagmiChainId = (typeof config)['chains'][number]['id']
