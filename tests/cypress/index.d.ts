import 'cypress'

declare global {
  namespace Cypress {
    interface Chainable {
      state: (of: 'window' | 'document') => Chainable<Window>
      mount: typeof mount
    }
  }
}
