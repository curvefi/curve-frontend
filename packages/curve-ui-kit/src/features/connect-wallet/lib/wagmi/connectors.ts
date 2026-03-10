import { t } from '@ui-kit/lib/i18n'
import { coinbaseWallet, injected, safe, walletConnect } from '@wagmi/connectors'
import type { CreateConnectorFn } from '@wagmi/core'

if (!window.eip6963Connectors) {
  throw new Error('eip6963Connectors not initialized, make sure eip-6963.ts is loaded before this file')
}

// project managed at https://cloud.reown.com/ set up by Schiavini, Michael also has access.
const WALLET_CONNECT_PROJECT_ID = '982ea4bdf92e49746bd040a981283b36'

export const INJECTED_CONNECTOR_ID = 'injected'

// Order matters for the connect wallet modal, list grows from bottom to top, so first one is shown all the way down.
export const connectors: CreateConnectorFn[] = [
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
  injected({ target: { id: 'injected', name: t`Browser Wallet`, provider: () => window.ethereum } }),
  ...window.eip6963Connectors.map((target) => injected({ target })),
]
