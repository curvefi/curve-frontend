import '@evm-ui/eip6963-test-setup'
import { skipTestsAfterFailure } from '@cy/support/ui'
import type { AppRoute } from './routes'

let routeDiagnostics: string[] = []
let betweenTestDiagnostics: string[] = []
let testStartedAt = 0
const ROUTE_DIAGNOSTICS_KEY = 'CurveCypressRouteDiagnostics'

type NavigationEvent = Event & {
  destination?: { url?: string }
  navigationType?: string
}

type NavigationWithEvents = {
  addEventListener(type: 'navigate', listener: (event: NavigationEvent) => void): void
}

const getEntryTimestamp = (entry: string) => {
  const match = /^\[([^\]]+)]/.exec(entry)
  return match ? Date.parse(match[1]) : Number.NaN
}

const isCurrentTestDiagnostic = (entry: string) => {
  const timestamp = getEntryTimestamp(entry)
  return Number.isNaN(timestamp) || timestamp >= testStartedAt - 1000
}

const isRelevantDiagnostic = (entry: string) => isCurrentTestDiagnostic(entry) || betweenTestDiagnostics.includes(entry)

const parseStoredRouteDiagnostics = (win: Window) => {
  try {
    const diagnostics: unknown = JSON.parse(win.localStorage?.getItem(ROUTE_DIAGNOSTICS_KEY) ?? '[]')
    return Array.isArray(diagnostics) && diagnostics.every(item => typeof item === 'string')
      ? diagnostics.filter(isCurrentTestDiagnostic)
      : []
  } catch {
    return []
  }
}

const getCurrentAutHref = () => {
  try {
    const win = (Cypress as unknown as { state(name: 'window'): Window | undefined }).state('window')
    return win?.location.href ?? '<no window>'
  } catch (error) {
    return `<unavailable: ${error instanceof Error ? error.message : String(error)}>`
  }
}

const formatDiagnostic = (message: string) => `[${new Date().toISOString()}] ${message}`

const addCommandRouteDiagnostic = (message: string) => {
  routeDiagnostics = [...routeDiagnostics, formatDiagnostic(message)]
}

const addBetweenTestDiagnostic = (message: string) => {
  const entry = formatDiagnostic(message)
  betweenTestDiagnostics = [...betweenTestDiagnostics, entry].slice(-20)
  routeDiagnostics = [...routeDiagnostics, entry]
}

const visitBlank = () => {
  const cypress = Cypress as unknown as { action(event: string, ...args: unknown[]): void }
  addBetweenTestDiagnostic(`firefox afterEach blank before href=${getCurrentAutHref()}`)

  return new Cypress.Promise<void>(resolve => {
    cy.once('window:load', () => {
      addBetweenTestDiagnostic(`firefox afterEach blank loaded href=${getCurrentAutHref()}`)
      resolve()
    })
    cypress.action('cy:url:changed', '')
    cypress.action('cy:visit:blank', { testIsolation: true })
  })
}

const addRouteDiagnostic = (win: Window, message: string) => {
  const entry = formatDiagnostic(message)
  routeDiagnostics = [...routeDiagnostics, entry]
  win.CurveCypressDiagnostics = [...(win.CurveCypressDiagnostics ?? []), entry]
  win.localStorage?.setItem(ROUTE_DIAGNOSTICS_KEY, JSON.stringify(routeDiagnostics))
}

const installRouteDiagnostics = (win: Window) => {
  const storedDiagnostics = parseStoredRouteDiagnostics(win)
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
Cypress.on('test:before:run', (_attributes, test) =>
  addBetweenTestDiagnostic(`test:before:run title=${test.title} href=${getCurrentAutHref()}`),
)
Cypress.on('test:after:run', (_attributes, test) =>
  addBetweenTestDiagnostic(`test:after:run title=${test.title} href=${getCurrentAutHref()}`),
)

Cypress.Commands.overwrite('visit', (originalFn, ...args) => {
  const [url] = args
  const requestedUrl = typeof url === 'string' ? url : url.url
  addCommandRouteDiagnostic(
    [
      `cy.visit before href=${getCurrentAutHref()}`,
      `testIsolation=${String(Cypress.config('testIsolation'))}`,
      `browser=${Cypress.browser.name}/${Cypress.browser.version}`,
    ].join(' '),
  )
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
  testStartedAt = Date.now()
  routeDiagnostics = betweenTestDiagnostics
  betweenTestDiagnostics = []
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
    const storedDiagnostics = parseStoredRouteDiagnostics(win)
    const diagnostics = Array.from(
      new Set([...routeDiagnostics, ...(win.CurveCypressDiagnostics ?? []), ...storedDiagnostics]),
    ).filter(isRelevantDiagnostic)
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

afterEach(() => {
  if (!Cypress.isBrowser('firefox')) return

  cy.then(() => {
    if (getCurrentAutHref() === 'about:blank') return

    return visitBlank()
  })
})

if (Cypress.config('isInteractive')) {
  skipTestsAfterFailure()
}
