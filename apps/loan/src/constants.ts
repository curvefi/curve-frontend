export const CRVUSD_ADDRESS = '0xf939e0a03fb07f59a73314e73794be0e57ac1b4e'
export const ASSETS_BASE_PATH = 'https://cdn.jsdelivr.net/gh/curvefi/curve-assets'
export const INVALID_ADDRESS = '0x0000000000000000000000000000000000000000'

export const ROUTE = {
  PAGE_MARKETS: '/markets',
  PAGE_CREATE: '/create',
  PAGE_MANAGE: '/manage',
  PAGE_RISK_DISCLAIMER: '/risk-disclaimer',
  PAGE_404: '/404',
  PAGE_INTEGRATIONS: '/integrations',
  PAGE_COMPENSATION: '/compensation',
}

export const REFRESH_INTERVAL = {
  '3s': 3000,
  '1m': 60000,
  '5m': 300000,
  '11m': 660000,
}

const CURVE_FI_MAIN = process.env.NODE_ENV === 'development' ? 'http://localhost:3000' : 'https://curve.fi'

export const CURVE_FI_ROUTE = {
  MAIN: CURVE_FI_MAIN,
  CRVUSD_POOLS: `${CURVE_FI_MAIN}/#/ethereum/pools?filter=crvusd`,
}

export const CONNECT_STAGE = {
  CONNECT_API: 'api',
  CONNECT_WALLET: 'connect-wallet',
  DISCONNECT_WALLET: 'disconnect-wallet',
  SWITCH_NETWORK: 'switch-network',
} as const
