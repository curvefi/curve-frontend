export { useSetChain } from '@web3-onboard/react'
export { useWallet, notify } from './hooks'
export { getWalletSignerAddress, getWalletChainId, getWalletSignerEns } from './utils/wallet-helpers'
export {
  ConnectionProvider,
  useConnection,
  CONNECT_STAGE,
  isLoading,
  isFailure,
  isSuccess,
  getLib,
  requireLib,
} from './ConnectionContext'
