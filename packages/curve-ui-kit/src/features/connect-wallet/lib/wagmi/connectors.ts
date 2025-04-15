import { coinbaseWallet, injected, safe, walletConnect } from '@wagmi/connectors'
import type { CreateConnectorFn } from '@wagmi/core'
import { WALLET_CONNECT_PROJECT_ID } from '../utils/walletModules'

export type ConnectorType =
  | typeof injected.type
  | typeof coinbaseWallet.type
  | typeof safe.type
  | typeof walletConnect.type

export const connectors: Record<ConnectorType, CreateConnectorFn> = {
  [injected.type]: injected(),
  [coinbaseWallet.type]: coinbaseWallet(),
  [safe.type]: safe(),
  [walletConnect.type]: walletConnect({ projectId: WALLET_CONNECT_PROJECT_ID, showQrModal: true }),
}
