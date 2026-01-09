import { t } from '@ui-kit/lib/i18n'
import { coinbaseWallet, injected, safe, walletConnect } from '@wagmi/connectors'
import type { CreateConnectorFn } from '@wagmi/core'

// project managed at https://cloud.reown.com/ set up by Schiavini, Michael also has access.
const WALLET_CONNECT_PROJECT_ID = '982ea4bdf92e49746bd040a981283b36'

export const BINANCE_CONNECTOR_ID = 'wallet.binance.com'

export const connectors: CreateConnectorFn[] = [
  injected({ target: { id: 'injected', name: t`Browser Wallet`, provider: () => window.ethereum } }),
  injected({
    target: { id: BINANCE_CONNECTOR_ID, name: t`Binance Wallet`, provider: () => window.binancew3w?.ethereum },
  }),
  coinbaseWallet({ preference: { options: 'all', telemetry: false } }),
  safe(),
  walletConnect({
    projectId: WALLET_CONNECT_PROJECT_ID,
    showQrModal: true,
    qrModalOptions: {
      themeVariables: {
        // Should be enough to pop over our connection modal
        '--wcm-z-index': '1301',
      },
    },
  }),
]
