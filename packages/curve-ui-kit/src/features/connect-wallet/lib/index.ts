export type { Wallet } from './types'
export { getWalletSignerAddress, getWalletChainId, getWalletSignerEns } from './utils/wallet-helpers'
export { useSetChain, useWallet, notify } from './hooks'
export { SupportedWallets } from '@ui-kit/features/connect-wallet/lib/wagmi/wallets'
