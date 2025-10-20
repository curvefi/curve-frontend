import { coinbaseWallet, injected, safe, walletConnect } from '@wagmi/connectors'
import type { CreateConnectorFn } from '@wagmi/core'

// project managed at https://cloud.reown.com/ set up by Schiavini, Michael also has access.
const WALLET_CONNECT_PROJECT_ID = '982ea4bdf92e49746bd040a981283b36'

const BINANCE_CONNECTOR_TYPE = 'wallet.binance.com'

export type ConnectorType =
  | typeof injected.type
  | typeof coinbaseWallet.type
  | typeof safe.type
  | typeof walletConnect.type
  | typeof BINANCE_CONNECTOR_TYPE

export const connectors: Record<ConnectorType, CreateConnectorFn> = {
  [injected.type]: injected(),
  [BINANCE_CONNECTOR_TYPE]: injected({
    target: {
      // Provide the injected target to avoid window.ethereum provider overwrite conflict
      id: BINANCE_CONNECTOR_TYPE,
      name: 'Binance Wallet Injected',
      provider: () => window.binancew3w?.ethereum,
    },
  }),
  [coinbaseWallet.type]: coinbaseWallet({ preference: { options: 'all', telemetry: false } }),
  [safe.type]: safe(),
  [walletConnect.type]: walletConnect({
    projectId: WALLET_CONNECT_PROJECT_ID,
    showQrModal: true,
    qrModalOptions: {
      themeVariables: {
        // Should be enough to pop over our connection modal
        '--wcm-z-index': '1301',
      },
    },
  }),
}
