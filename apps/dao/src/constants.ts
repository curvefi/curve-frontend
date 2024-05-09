export const MAIN_ROUTE = {
  PAGE_PROPOSALS: '/proposals',
  PAGE_GAUGES: '/gauges',
}

export const ROUTE = {
  ...MAIN_ROUTE,
  PAGE_404: '/404',
} as const

export const CONNECT_STAGE = {
  CONNECT_API: 'api',
  CONNECT_WALLET: 'connect-wallet',
  DISCONNECT_WALLET: 'disconnect-wallet',
  SWITCH_NETWORK: 'switch-network',
} as const

export const REFRESH_INTERVAL = {
  '3s': 3000,
  '1m': 60000,
  '5m': 300000,
  '11m': 660000,
}
