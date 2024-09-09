export const NETWORK_TOKEN = '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee'
export const INVALID_ADDRESS = '0x0000000000000000000000000000000000000000'

export const WS_ADDRESS = 'wss://prices.curve.fi/v1/stream/ws'
export const LARGE_APY = 5000

export const MAIN_ROUTE = {
  PAGE_SWAP: '/swap',
  PAGE_POOLS: '/pools',
  PAGE_CREATE_POOL: '/create-pool',
  PAGE_DEPLOY_GAUGE: '/deploy-gauge',
  PAGE_DASHBOARD: '/dashboard',
  PAGE_LOCKER: '/locker',
  PAGE_INTEGRATIONS: '/integrations',
  PAGE_COMPENSATION: '/compensation',
  PAGE_RISK_DISCLAIMER: '/risk-disclaimer',
  PAGE_404: '/404',
}

export const ROUTE = {
  ...MAIN_ROUTE,
  PAGE_LOCKER_CREATE: '/create',
  PAGE_LOCKER_ADJUST_CRV: '/adjust_crv',
  PAGE_LOCKER_ADJUST_DATE: '/adjust_date',
  PAGE_POOL_DEPOSIT: '/deposit',
  PAGE_POOL_WITHDRAW: '/withdraw',
  PAGE_POOL_MANAGE: '/manage-gauge',
} as const

// TODO rename to MS
export const REFRESH_INTERVAL = {
  '1s': 1000,
  '2s': 1000 * 2,
  '3s': 1000 * 3,
  '15s': 1000 * 15,
  '1m': 1000 * 60,
  '5m': 1000 * 60 * 5,
  '10m': 1000 * 60 * 10,
  '11m': 1000 * 60 * 11,
  '1h': 1000 * 60 * 60,
  '1d': 1000 * 60 * 60 * 24,
  Inf: Infinity,
} as const

export const TIME_FRAMES = {
  WEEK: 7 * 24 * 60 * 60,
  MONTH: 30 * 24 * 60 * 60,
} as const

export const CONNECT_STAGE = {
  CONNECT_API: 'api',
  CONNECT_WALLET: 'connect-wallet',
  DISCONNECT_WALLET: 'disconnect-wallet',
  SWITCH_NETWORK: 'switch-network',
} as const
