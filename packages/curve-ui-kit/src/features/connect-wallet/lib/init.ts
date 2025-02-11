import {
  bitget,
  coinbaseWalletSdk,
  fortmatic,
  frontier,
  gnosis,
  injected,
  ledger,
  metamaskSDKWallet,
  phantom,
  torus,
  trezor,
  trust,
  walletConnect,
} from './utils/walletModules'
import * as onboard from '@web3-onboard/react'
import { ThemeKey } from '@ui-kit/themes/basic-theme'

export const initOnboard = (
  themeType: ThemeKey,
  networks: Record<number, { hex: string; symbol: string; name: string; rpcUrl: string }>,
) =>
  onboard.init({
    wallets: [
      injected,
      trezor,
      ledger,
      gnosis,
      coinbaseWalletSdk,
      fortmatic,
      walletConnect,
      torus,
      phantom,
      frontier,
      bitget,
      trust,
      metamaskSDKWallet,
    ],
    chains: Object.values(networks).map(({ hex, name, rpcUrl, symbol }) => ({
      id: hex,
      token: symbol,
      label: name,
      rpcUrl,
    })),
    appMetadata: {
      name: 'Curve',
      description: 'Efficient stablecoin and non-stablecoin swapping',
      icon: 'https://classic.curve.fi/logo-square.svg',
    },
    disableFontDownload: true,
    notify: {
      desktop: {
        enabled: true,
        position: 'topRight',
      },
    },
    theme: themeType === 'chad' ? 'light' : themeType,
    accountCenter: {
      desktop: {
        enabled: false,
      },
      mobile: {
        enabled: false,
      },
    },
    connect: {
      autoConnectLastWallet: false,
    },
  })
