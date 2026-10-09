import { noop } from 'lodash'
import type { ReactNode } from 'react'
import { StellarApp } from '@/stellar/App'
import type { StellarAddress } from '@/stellar/features/connect-wallet/address'
import { WalletContext } from '@/stellar/features/connect-wallet/useWallet'
import { router } from '@/stellar/routes'
import { ComponentTestWrapper } from '@cy/support/helpers/ComponentTestWrapper'
import { API_LOAD_TIMEOUT } from '@cy/support/ui'
import { FormPlacementProvider } from '@ui/features/form-context/FormPlacementProvider'

export const StellarTestWrapper = ({ children, address }: { children: ReactNode; address?: StellarAddress }) => (
  <ComponentTestWrapper>
    <WalletContext
      value={{
        address,
        connectors: [],
        connect: () => Promise.resolve(),
        disconnect: () => Promise.resolve(),
        isConnected: Boolean(address),
        isConnecting: false,
        connectingToId: null,
        error: undefined,
        showModal: false,
        closeModal: noop,
      }}
    >
      <FormPlacementProvider placement="inline">{children}</FormPlacementProvider>
    </WalletContext>
  </ComponentTestWrapper>
)
/**
 * Mount the production app and navigate using its browser history, routes, and providers.
 * This should be an e2e test,
 **/
export const mountStellarApp = (path: string) => {
  cy.mount(<StellarApp />)
  cy.then(() => router.navigate({ to: path }))
  cy.get('[data-testid="data-table"]', API_LOAD_TIMEOUT).should('be.visible')
}
