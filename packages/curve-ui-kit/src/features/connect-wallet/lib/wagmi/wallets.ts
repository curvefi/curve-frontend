import createSvgIcon from '@mui/material/utils/createSvgIcon'
import type { ConnectorType } from '@ui-kit/features/connect-wallet/lib/wagmi/connectors'
import { CoinbaseIcon } from '@ui-kit/shared/icons/CoinbaseIcon'
import { KeplrIcon } from '@ui-kit/shared/icons/KeplrIcon'
import { MetamaskIcon } from '@ui-kit/shared/icons/MetamaskIcon'
import { PhantomIcon } from '@ui-kit/shared/icons/PhantomIcon'
import { RabbyIcon } from '@ui-kit/shared/icons/RabbyIcon'
import { RainbowIcon } from '@ui-kit/shared/icons/RainbowIcon'
import { WalletConnectIcon } from '@ui-kit/shared/icons/WalletConnectIcon'
import { WalletIcon } from '@ui-kit/shared/icons/WalletIcon'

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
