import 'cypress'
import { type MountOptions, type MountReturn } from 'cypress/react'
import { type ReactNode } from 'react'

declare global {
  namespace Cypress {
    interface Chainable {
      state: (of: 'window' | 'document') => Chainable<Window>
      mount: (node: ReactNode, options?: MountOptions, rerenderKey?: string) => Chainable<MountReturn>
    }
  }
}
