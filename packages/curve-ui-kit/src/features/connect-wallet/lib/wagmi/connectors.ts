import { coinbaseWallet, injected, safe, walletConnect } from '@wagmi/connectors'
import type { CreateConnectorFn } from '@wagmi/core'

// project managed at https://cloud.reown.com/ set up by Schiavini, Michael also has access.
const WALLET_CONNECT_PROJECT_ID = '982ea4bdf92e49746bd040a981283b36'

const BINANCE_ID = 'wallet.binance.com'

export type ConnectorType =
  | typeof injected.type
  | typeof coinbaseWallet.type
  | typeof safe.type
  | typeof walletConnect.type
  | 'wallet.binance.com'

export const connectors: Record<ConnectorType, CreateConnectorFn> = {
  [injected.type]: injected(),
  binance: injected({
    target: {
      // Provide the injected target to avoid window.ethereum provider overwrite conflict
      id: BINANCE_ID,
      name: 'Binance Wallet Injected',
      provider: () => window.binancew3w.ethereum,
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
