export const INVALID_ADDRESS = '0x0000000000000000000000000000000000000000'
export const LARGE_APY = 5000000

export const MAIN_ROUTE = {
  PAGE_MARKETS: '/markets',
  PAGE_RISK_DISCLAIMER: '/risk-disclaimer',
  PAGE_INTEGRATIONS: '/integrations',
}

export const ROUTE = {
  ...MAIN_ROUTE,
  PAGE_CREATE: '/create',
  PAGE_MANAGE: '/manage',
  PAGE_VAULT: '/vault',
  PAGE_404: '/404',
}

export const REFRESH_INTERVAL = {
  '3s': 3000,
  '4s': 4000,
  '10s': 10000,
  '1m': 60000,
  '5m': 300000,
  '11m': 660000,
}

// TODO: translation
export const NOFITY_MESSAGE = {
  pendingConfirm: 'Pending wallet confirmation.',
}
