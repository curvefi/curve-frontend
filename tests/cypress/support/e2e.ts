import '@evm-ui/eip6963-test-setup'
import { skipTestsAfterFailure } from '@cy/support/ui'
import type { AppRoute } from './routes'

let routeDiagnostics: string[] = []
const ROUTE_DIAGNOSTICS_KEY = 'CurveCypressRouteDiagnostics'

type NavigationEvent = Event & {
  destination?: { url?: string }
  navigationType?: string
}

type NavigationWithEvents = {
  addEventListener(type: 'navigate', listener: (event: NavigationEvent) => void): void
}

const addCommandRouteDiagnostic = (message: string) => {
  routeDiagnostics = [...routeDiagnostics, `[${new Date().toISOString()}] ${message}`]
}

const addRouteDiagnostic = (win: Window, message: string) => {
  const timestamp = new Date().toISOString()
  const entry = `[${timestamp}] ${message}`
  routeDiagnostics = [...routeDiagnostics, entry]
  win.CurveCypressDiagnostics = [...(win.CurveCypressDiagnostics ?? []), entry]
  win.localStorage?.setItem(ROUTE_DIAGNOSTICS_KEY, JSON.stringify(routeDiagnostics))
}

const installRouteDiagnostics = (win: Window) => {
  const storedDiagnostics = JSON.parse(win.localStorage?.getItem(ROUTE_DIAGNOSTICS_KEY) ?? '[]') as string[]
  routeDiagnostics = [...storedDiagnostics, ...routeDiagnostics]
  addRouteDiagnostic(win, `window:before:load ${win.location.href}`)
  win.CurveCypressDiagnostics = routeDiagnostics

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
  win.addEventListener('beforeunload', () => addRouteDiagnostic(win, `beforeunload ${win.location.href}`))
  win.addEventListener('pagehide', () => addRouteDiagnostic(win, `pagehide ${win.location.href}`))
  win.addEventListener('unload', () => addRouteDiagnostic(win, `unload ${win.location.href}`))

  ;(win as Window & { navigation?: NavigationWithEvents }).navigation?.addEventListener('navigate', event => {
    addRouteDiagnostic(
      win,
      `navigation.navigate to=${event.destination?.url ?? '<unknown>'} type=${event.navigationType ?? '<unknown>'} from=${win.location.href}`,
    )
  })
}

/** Global Cypress exception handler to ignore specific known errors. */
Cypress.on(
  'uncaught:exception',
  (
    error, // Reverted transaction errors are passed as a prop, React DevTools tries to serialize that and fails.
  ) => !error?.message?.includes('Do not know how to serialize a BigInt'),
)

Cypress.on('window:before:load', installRouteDiagnostics)
Cypress.on('url:changed', url => addCommandRouteDiagnostic(`Cypress url:changed ${url}`))

Cypress.Commands.overwrite('visit', (originalFn, ...args) => {
  const [url] = args
  const requestedUrl = typeof url === 'string' ? url : url.url
  addCommandRouteDiagnostic(`cy.visit requested url=${requestedUrl ?? '<unknown>'}`)
  return originalFn(...args)
})

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
  routeDiagnostics = []
  cy.then(() => {
    const test = Cypress.currentTest
    Cypress.log({
      name: 'test route',
      message: `${test.titlePath.join(' > ')}: ${Cypress.config('baseUrl')}`,
    })
  })
  cy.window({ log: false }).then(win => win.localStorage?.removeItem(ROUTE_DIAGNOSTICS_KEY))
})

afterEach(function () {
  if (this.currentTest?.state !== 'failed') return

  cy.window({ log: false }).then(win => {
    const storedDiagnostics = JSON.parse(win.localStorage?.getItem(ROUTE_DIAGNOSTICS_KEY) ?? '[]') as string[]
    const diagnostics = Array.from(
      new Set([...routeDiagnostics, ...(win.CurveCypressDiagnostics ?? []), ...storedDiagnostics]),
    )
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
