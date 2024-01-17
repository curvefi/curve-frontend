import * as onboard from '@web3-onboard/react'
import {
  injected,
  trezor,
  // ledger,
  gnosis,
  coinbaseWalletSdk,
  fortmatic,
  walletConnect,
  portis,
  torus,
  phantom,
  frontier,
  bitget,
  trust,
} from './utils/walletModules'

export * from '@web3-onboard/react'

// @ts-ignore
export function initOnboard(i18n, locale, theme, networks) {
  const chains = Object.keys(networks).map((key) => {
    const network = networks[+key]
    return {
      id: network.hex,
      token: network.symbol,
      label: network.name,
      rpcUrl: network.rpcUrlConnectWallet,
    }
  })
  const walletState = onboard.init({
    wallets: [
      injected,
      trezor,
      // ledger, //compromised remove for now
      gnosis,
      coinbaseWalletSdk,
      fortmatic,
      walletConnect,
      portis,
      torus,
      phantom,
      frontier,
      bitget,
      trust,
    ],
    chains,
    appMetadata: {
      name: 'Curve',
      description: 'Efficient stablecoin and non-stablecoin swapping',
      icon: 'https://classic.curve.fi/logo-square.svg',
    },
    disableFontDownload: true,
    i18n,
    notify: {
      desktop: {
        enabled: true,
        transactionHandler: () => {},
        position: 'topRight',
      },
    },
    theme,
    accountCenter: {
      desktop: {
        enabled: false,
      },
      mobile: {
        enabled: false,
      },
    },
  })

  if (walletState && locale) {
    walletState.state.actions.setLocale(locale)
  }

  return walletState
}
