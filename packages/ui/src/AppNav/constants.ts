import type { AppPage } from './types'

const isDevelopment = process.env.NODE_ENV === 'development'

// prettier-ignore
export const APP_LINK: {[key: string]: AppPage} = {
  classicMain: { route: 'https://classic.curve.fi/', label: 'Classic UI', groupedTitle: 'classicMain' },
  main: { route: isDevelopment ? 'http://localhost:3000' : _getRoute('curve.fi'), label: 'DEX', target: '_self', groupedTitle: 'main' },
  crvusd: { route: isDevelopment ? 'http://localhost:3001' : _getRoute('crvusd.curve.fi'), label: 'crvUSD', target: '_self', groupedTitle: 'crvusd' },
  lend: { route: isDevelopment ? 'http://localhost:3003' : _getRoute('lend.curve.fi'), label: 'Lend', target: '_self', groupedTitle: 'lend' },
}

export const APPS_LINKS = [
  { route: 'https://dao.curve.fi/', label: 'DAO' },
  { route: 'https://gov.curve.fi/', label: 'Governance' },
]

function _getRoute(host: string) {
  const windowHost = typeof window !== 'undefined' ? window.location.host : ''
  const isStaging = windowHost.startsWith('staging')
  return isStaging ? `https://staging${host === 'curve.fi' ? `.${host}` : `-${host}`}/` : `https://${host}/`
}
