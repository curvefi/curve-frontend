export const MAIN_ROUTE = {
  PAGE_PROPOSALS: '/proposals',
  PAGE_GAUGEVOTING: '/gauge-voting',
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
