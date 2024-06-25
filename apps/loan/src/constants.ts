export const CRVUSD_ADDRESS = '0xf939e0a03fb07f59a73314e73794be0e57ac1b4e'
export const ASSETS_BASE_PATH = 'https://cdn.jsdelivr.net/gh/curvefi/curve-assets'
export const INVALID_ADDRESS = '0x0000000000000000000000000000000000000000'

export const MAIN_ROUTE = {
  PAGE_MARKETS: '/markets',
  PAGE_RISK_DISCLAIMER: '/risk-disclaimer',
  PAGE_INTEGRATIONS: '/integrations',
}

export const ROUTE = {
  ...MAIN_ROUTE,
  PAGE_CREATE: '/create',
  PAGE_MANAGE: '/manage',
  PAGE_404: '/404',
}

export const REFRESH_INTERVAL = {
  '3s': 3000,
  '1m': 60000,
  '5m': 300000,
  '11m': 660000,
}

const CURVE_FI_MAIN = process.env.NODE_ENV === 'development' ? 'http://localhost:3000' : 'https://curve.fi'

export const CURVE_FI_ROUTE = {
  MAIN: process.env.NODE_ENV === 'development' ? 'http://localhost:3001' : 'https://crvusd.curve.fi',
  CRVUSD_POOLS: `${CURVE_FI_MAIN}/#/ethereum/pools?filter=crvusd`,
}
