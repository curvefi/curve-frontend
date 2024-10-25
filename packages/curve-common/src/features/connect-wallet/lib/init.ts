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
  walletConnect
} from './utils/walletModules'
import * as onboard from '@web3-onboard/react'

export function initOnboard(i18n: any, locale: any, themeType: any, networks: any) {
  let theme: 'system' | 'light' | 'dark' = 'system'
  if (themeType === 'default' || themeType === 'chad') {
    theme = 'light'
  } else if (themeType === 'dark') {
    theme = 'dark'
  }

  const chains = Object.keys(networks).map((key) => {
    const network = networks[+key]
    return {
      id: network.hex,
      token: network.symbol,
      label: network.name,
      rpcUrl: network.rpcUrlConnectWallet
    }
  })

  const walletState = onboard.init({
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
      metamaskSDKWallet
    ],
    chains,
    appMetadata: {
      name: 'Curve',
      description: 'Efficient stablecoin and non-stablecoin swapping',
      icon: 'https://classic.curve.fi/logo-square.svg'
    },
    disableFontDownload: true,
    i18n,
    notify: {
      desktop: {
        enabled: true,
        transactionHandler: () => {
        },
        position: 'topRight'
      }
    },
    theme,
    accountCenter: {
      desktop: {
        enabled: false
      },
      mobile: {
        enabled: false
      }
    },
    connect: {
      autoConnectLastWallet: false
    }
  })

  if (walletState && locale) {
    walletState.state.actions.setLocale(locale)
  }

  return walletState
}