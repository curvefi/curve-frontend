/* eslint-disable @typescript-eslint/consistent-type-definitions */
import 'cypress'
import { type MountOptions, type MountReturn } from 'cypress/react'
import { type ReactNode } from 'react'

declare global {
  interface Window {
    CypressNoTestConnector?: string
    CypressTestConnectorChain?: number
  }

  namespace Cypress {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars,@typescript-eslint/no-explicit-any
    interface Chainable<Subject = any> {
      visitWithoutTestConnector(route: AppRoute, options?: Partial<Cypress.VisitOptions>): Chainable<AUTWindow>
    }

    interface Chainable {
      state: (of: 'window' | 'document') => Chainable<Window>
      mount: (node: ReactNode, options?: MountOptions, rerenderKey?: string) => Chainable<MountReturn>
    }
  }
}
