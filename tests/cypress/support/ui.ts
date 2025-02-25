import { oneInt, oneOf } from '@/support/generators'

export const [MIN_WIDTH, TABLET_BREAKPOINT, DESKTOP_BREAKPOINT, MAX_WIDTH] = [320, 640, 1200, 2000]
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

export const isInViewport = ($el: JQuery) => {
  const height = Cypress.$(cy.state('window')).height()!
  const width = Cypress.$(cy.state('window')).width()!
  const rect = $el[0].getBoundingClientRect()
  const [x, y] = [rect.left + rect.width / 2, rect.top + rect.height / 2]
  return y > 0 && y < height && x > 0 && x < width
}

export const checkIsDarkMode = (win: Cypress.AUTWindow) => win.matchMedia('(prefers-color-scheme: dark)').matches

const oneDexPath = () => oneOf('', 'dex')
export const oneAppPath = () => oneOf(...([oneDexPath(), 'lend', 'dao', 'crvusd'] as const))
export type AppPath = ReturnType<typeof oneAppPath>

export const LOAD_TIMEOUT = { timeout: 20000 }

// scrollbar in px for the test browser. Firefox behaves when headless.
export const SCROLL_WIDTH = Cypress.browser.name === 'firefox' ? (Cypress.browser.isHeadless ? 12 : 0) : 15
