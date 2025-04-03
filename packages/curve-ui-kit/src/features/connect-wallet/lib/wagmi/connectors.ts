import { WALLET_CONNECT_PROJECT_ID } from '@ui-kit/features/connect-wallet/lib/utils/walletModules'
import { coinbaseWallet, injected, safe, walletConnect } from '@wagmi/connectors'
import type { CreateConnectorFn } from '@wagmi/core'

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
