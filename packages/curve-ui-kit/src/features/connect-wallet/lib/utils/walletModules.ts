import bitgetModule from '@web3-onboard/bitget'
import coinbaseWalletModule from '@web3-onboard/coinbase'
import fortmaticModule from '@web3-onboard/fortmatic'
import frontierModule from '@web3-onboard/frontier'
import gnosisModule from '@web3-onboard/gnosis'
import injectedModule from '@web3-onboard/injected-wallets'
import ledgerModule from '@web3-onboard/ledger'
import metamaskSDK from '@web3-onboard/metamask'
import phantomModule from '@web3-onboard/phantom'
import torusModule from '@web3-onboard/torus'
import trezorModule from '@web3-onboard/trezor'
import trustModule from '@web3-onboard/trust'
import walletConnectModule from '@web3-onboard/walletconnect'

function getWalletConnectProjectId() {
  // old project ID, not sure who's the admin
  const OLD_WALLET_CONNECT_PROJECT_ID = 'c685334a8b28bf7c733632a5c49de23f'
  // project managed at https://cloud.reown.com/ set up by Schiavini, Michael also has access.
  const NEW_WALLET_CONNECT_PROJECT_ID = '982ea4bdf92e49746bd040a981283b36'

  return window.location.origin.includes('curve.fi') ? OLD_WALLET_CONNECT_PROJECT_ID : NEW_WALLET_CONNECT_PROJECT_ID
}

export const WALLET_CONNECT_ACCOUNT = `c3fe8dd8-93df-44af-803f-83798aa1d440`

// only works on curve-dapp-git-chore-wallet-connect-curvefi.vercel.app
export const VERCEL_DOMAIN_VERIFICATION = '84ba44da9bf094485e9a78634683c0cbbe56795f765e65ae0152a9dda7242eac'
export const CURVE_DOMAIN_VERIFICATION = '3d76b3cd8cd754f34ac1c18ff25dc23ee9b80fc7f75800041335263b11f20b19'

export const injected = injectedModule()
export const trezor = trezorModule({
  email: 'info@curve.fi',
  appUrl: 'https://curve.fi',
})
export const ledger = () =>
  ledgerModule({
    walletConnectVersion: 2,
    projectId: getWalletConnectProjectId(),
  })
export const gnosis = gnosisModule({
  whitelistedDomains: [
    /^https:\/\/gnosis-safe\.io$/,
    /^https:\/\/app\.safe\.global$/,
    /^https:\/\/safe\.global$/,
    /^https:\/\/safe\.mainnet\.frax\.com$/,
    /^https:\/\/safe\.optimism\.io$/,
  ],
})
export const coinbaseWalletSdk = coinbaseWalletModule({ darkMode: true })
export const fortmatic = fortmaticModule({ apiKey: 'pk_live_190B10CE18F47DCD' })

export const walletConnect = () =>
  walletConnectModule({
    projectId: getWalletConnectProjectId(),
    dappUrl: window.location.origin,
  })

export const torus = torusModule()
export const phantom = phantomModule()
export const frontier = frontierModule()
export const trust = trustModule()
export const bitget = bitgetModule()

export const metamaskSDKWallet = metamaskSDK({
  options: {
    extensionOnly: false,
    dappMetadata: {
      url: 'https://curve.fi',
      name: 'Curve',
      iconUrl: 'https://classic.curve.fi/logo-square.svg',
    },
  },
})
