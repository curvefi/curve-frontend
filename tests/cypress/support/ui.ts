import { oneInt, oneOf } from '@cy/support/generators'

export const e2eBaseUrl = () => Cypress.config('baseUrl')

export const [MIN_WIDTH, TABLET_BREAKPOINT, DESKTOP_BREAKPOINT, MAX_WIDTH] = [320, 820, 1200, 2000]
const [MIN_HEIGHT, MAX_HEIGHT] = [600, 1000]

export const oneDesktopViewport = () => [oneInt(DESKTOP_BREAKPOINT, MAX_WIDTH), oneInt(MIN_HEIGHT, MAX_HEIGHT)] as const

export const oneMobileViewport = () => [oneInt(MIN_WIDTH, TABLET_BREAKPOINT), oneInt(MIN_HEIGHT, MAX_HEIGHT)] as const

export const oneTabletViewport = () =>
  [oneInt(TABLET_BREAKPOINT, DESKTOP_BREAKPOINT), oneInt(MIN_HEIGHT, MAX_HEIGHT)] as const

export const oneMobileOrTabletViewport = () =>
  [oneInt(MIN_WIDTH, DESKTOP_BREAKPOINT), oneInt(MIN_HEIGHT, MAX_HEIGHT)] as const

export type Breakpoint = 'mobile' | 'tablet' | 'desktop'
export const oneViewport = (): [number, number, Breakpoint] =>
  oneOf([...oneDesktopViewport(), 'desktop'], [...oneMobileViewport(), 'mobile'], [...oneTabletViewport(), 'tablet'])

const isInViewport = ($el: JQuery) => {
  const height = Cypress.$(cy.state('window')).height()!
  const width = Cypress.$(cy.state('window')).width()!
  const rect = $el[0].getBoundingClientRect()
  const [x, y] = [rect.left + rect.width / 2, rect.top + rect.height / 2]
  return y > 0 && y < height && x > 0 && x < width
}

export const assertInViewport = ($el: JQuery) =>
  expect(isInViewport($el), `${$el} should be in the viewport`).to.be.true
export const assertNotInViewport = ($el: JQuery) =>
  expect(isInViewport($el), `${$el} should not be in the viewport`).to.be.false

const oneDexPath = () => oneOf('', 'dex')
export const oneAppPath = () => oneOf(...([oneDexPath(), 'lend', 'dao', 'crvusd', 'llamalend'] as const))

export type AppPath = ReturnType<typeof oneAppPath>

export const LOAD_TIMEOUT = { timeout: 30000 }
export const API_LOAD_TIMEOUT = { timeout: 120000 } // unfortunately the prices API can be REAL SLOW 😭

// scrollbar in px for the test browser. Firefox behaves when headless.
export const SCROLL_WIDTH = Cypress.browser.name === 'firefox' ? (Cypress.browser.isHeadless ? 12 : 0) : 15

// tests that are flaky in CI, hard to reproduce. Please try to avoid using this.
export const RETRY_IN_CI = { retries: { openMode: 0, runMode: 5 } }
