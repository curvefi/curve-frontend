import injectedModule from '@web3-onboard/injected-wallets'
import trezorModule from '@web3-onboard/trezor'
import ledgerModule from '@web3-onboard/ledger'
import gnosisModule from '@web3-onboard/gnosis'
import coinbaseWalletModule from '@web3-onboard/coinbase'
import fortmaticModule from '@web3-onboard/fortmatic'
import walletConnectModule from '@web3-onboard/walletconnect'
import torusModule from '@web3-onboard/torus'
import phantomModule from '@web3-onboard/phantom'
import frontierModule from '@web3-onboard/frontier'
import trustModule from '@web3-onboard/trust'
import bitgetModule from '@web3-onboard/bitget'
import metamaskSDK from '@web3-onboard/metamask'

const WALLET_CONNECT_PROJECT_ID = 'c685334a8b28bf7c733632a5c49de23f'

export const injected = injectedModule()
export const trezor = trezorModule({
  email: 'info@curve.fi',
  appUrl: 'https://curve.fi',
})
export const ledger = ledgerModule({
  walletConnectVersion: 2,
  projectId: WALLET_CONNECT_PROJECT_ID,
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

export const walletConnect = walletConnectModule({
  projectId: WALLET_CONNECT_PROJECT_ID,
  dappUrl: 'https://curve.fi',
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
