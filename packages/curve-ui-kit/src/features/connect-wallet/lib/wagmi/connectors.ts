import { WALLET_CONNECT_PROJECT_ID } from '@ui-kit/features/connect-wallet/lib/utils/walletModules'
import { coinbaseWallet, injected, safe, walletConnect } from '@wagmi/connectors'

export const Connectors = {
  [injected.type]: injected(),
  [coinbaseWallet.type]: coinbaseWallet(),
  [safe.type]: safe() as ReturnType<typeof safe>,
  [walletConnect.type]: walletConnect({ projectId: WALLET_CONNECT_PROJECT_ID }),
}

export type ConnectorType = keyof typeof Connectors
