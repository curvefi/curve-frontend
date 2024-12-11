const [MIN_WIDTH, TABLET_BREAKPOINT, DESKTOP_BREAKPOINT, MAX_WIDTH] = [320, 640, 1200, 2000]
const [MIN_HEIGHT, MAX_HEIGHT] = [600, 1000]

const randomInt = (min: number, maxExclusive: number): number => Math.floor(Math.random() * (maxExclusive - min)) + min

export const oneDesktopViewport = () =>
  [randomInt(DESKTOP_BREAKPOINT, MAX_WIDTH), randomInt(MIN_HEIGHT, MAX_HEIGHT)] as const

export const oneMobileViewport = () =>
  [randomInt(MIN_WIDTH, TABLET_BREAKPOINT), randomInt(MIN_HEIGHT, MAX_HEIGHT)] as const

export const oneTabletViewport = () =>
  [randomInt(TABLET_BREAKPOINT, DESKTOP_BREAKPOINT), randomInt(MIN_HEIGHT, MAX_HEIGHT)] as const

export const oneMobileOrTabletViewport = () =>
  [randomInt(MIN_WIDTH, DESKTOP_BREAKPOINT), randomInt(MIN_HEIGHT, MAX_HEIGHT)] as const

export const oneViewport = () => [randomInt(MIN_WIDTH, MAX_WIDTH), randomInt(MIN_HEIGHT, MAX_HEIGHT)] as const
