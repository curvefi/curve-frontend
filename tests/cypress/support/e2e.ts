import '@evm-ui/eip6963-test-setup'
import { skipTestsAfterFailure } from '@cy/support/ui'
import type { AppRoute } from './routes'

const addRouteDiagnostic = (win: Window, message: string) => {
  const timestamp = new Date().toISOString()
  const entry = `[${timestamp}] ${message}`
  win.CurveCypressDiagnostics = [...(win.CurveCypressDiagnostics ?? []), entry]
}

const installRouteDiagnostics = (win: Window) => {
  addRouteDiagnostic(win, `window:before:load ${win.location.href}`)

  const pushState = win.history.pushState.bind(win.history)
  const replaceState = win.history.replaceState.bind(win.history)
  win.history.pushState = function (...args) {
    addRouteDiagnostic(win, `history.pushState to=${String(args[2])} from=${win.location.href}`)
    return pushState.apply(this, args)
  }
  win.history.replaceState = function (...args) {
    addRouteDiagnostic(win, `history.replaceState to=${String(args[2])} from=${win.location.href}`)
    return replaceState.apply(this, args)
  }

  win.addEventListener('popstate', () => addRouteDiagnostic(win, `popstate ${win.location.href}`))
  win.addEventListener('hashchange', () => addRouteDiagnostic(win, `hashchange ${win.location.href}`))
}

/** Global Cypress exception handler to ignore specific known errors. */
Cypress.on(
  'uncaught:exception',
  (
    error, // Reverted transaction errors are passed as a prop, React DevTools tries to serialize that and fails.
  ) => !error?.message?.includes('Do not know how to serialize a BigInt'),
)

Cypress.on('window:before:load', installRouteDiagnostics)

/**
 * For most of our e2e tests we have a wagmi test connect that auto-connects, so there's a wallet available.
 * However, in some cases we want to test functionality without a wallet connected.
 */
Cypress.Commands.add('visitWithoutTestConnector', (route: AppRoute, options?: Partial<Cypress.VisitOptions>) =>
  cy.visit(`/${route.replace(/^\//, '')}`, {
    ...options,
    onBeforeLoad(win) {
      win.CypressNoTestConnector = 'true'
      options?.onBeforeLoad?.(win)
    },
  }),
)

beforeEach(() => {
  cy.then(() => {
    const test = Cypress.currentTest
    Cypress.log({
      name: 'test route',
      message: `${test.titlePath.join(' > ')}: ${Cypress.config('baseUrl')}`,
    })
  })
})

afterEach(function () {
  if (this.currentTest?.state !== 'failed') return

  cy.window({ log: false }).then(win => {
    const diagnostics = win.CurveCypressDiagnostics ?? []
    const message = [
      'Route diagnostics for failed Cypress test:',
      `spec: ${Cypress.spec.relative}`,
      `test: ${Cypress.currentTest.titlePath.join(' > ')}`,
      `final href: ${win.location.href}`,
      `final pathname: ${win.location.pathname}`,
      ...diagnostics.slice(-80),
    ].join('\n')

    Cypress.log({ name: 'route diagnostics', message })
    cy.task('log', `\n${message}\n`, { log: false })
  })
})

if (Cypress.config('isInteractive')) {
  skipTestsAfterFailure()
}
