export const [MIN_WIDTH, TABLET_BREAKPOINT, DESKTOP_BREAKPOINT, MAX_WIDTH] = [320, 640, 1200, 2000]
const [MIN_HEIGHT, MAX_HEIGHT] = [600, 1000]

const randomInt = (min: number, maxExclusive: number): number => Math.floor(Math.random() * (maxExclusive - min)) + min
export const oneOf = <T>(...options: T[]) => options[randomInt(0, options.length)]

export const oneDesktopViewport = () =>
  [randomInt(DESKTOP_BREAKPOINT, MAX_WIDTH), randomInt(MIN_HEIGHT, MAX_HEIGHT)] as const

export const oneMobileViewport = () =>
  [randomInt(MIN_WIDTH, TABLET_BREAKPOINT), randomInt(MIN_HEIGHT, MAX_HEIGHT)] as const

export const oneTabletViewport = () =>
  [randomInt(TABLET_BREAKPOINT, DESKTOP_BREAKPOINT), randomInt(MIN_HEIGHT, MAX_HEIGHT)] as const

export const oneMobileOrTabletViewport = () =>
  [randomInt(MIN_WIDTH, DESKTOP_BREAKPOINT), randomInt(MIN_HEIGHT, MAX_HEIGHT)] as const

export const oneViewport = () => oneOf(oneDesktopViewport(), oneMobileViewport(), oneTabletViewport())

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
