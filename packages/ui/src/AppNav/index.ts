import type { AppPage } from './types'

export * from './styles'
export { default as AppNavMobile } from './AppNavMobile'
export { default as AppNavSecondary } from './AppNavSecondary'

const isDevelopment = process.env.NODE_ENV === 'development'

// prettier-ignore
export const APP_LINK: {[key: string]: AppPage} = {
  classicMain: { route: 'https://classic.curve.fi/', label: 'Classic UI' },
  main: { route: isDevelopment ? 'http://localhost:3000' : 'https://curve.fi/', label: 'Curve.fi', target: '_self' },
  crvusd: { route: isDevelopment ? 'http://localhost:3001' : 'https://crvusd.curve.fi/', label: 'crvUSD', target: '_self' },
  lend: { route: isDevelopment ? 'http://localhost:3003' : 'https://lend.curve.fi/', label: 'Llama Lend', target: '_self' },
}

export const APPS_LINKS = [
  { route: 'https://dao.curve.fi/', label: 'DAO' },
  { route: 'https://gov.curve.fi/', label: 'Governance' },
]
