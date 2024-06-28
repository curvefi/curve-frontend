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
} as const

// TODO rename to MS
export const REFRESH_INTERVAL = {
  '3s': 3000,
  '15s': 15000,
  '1m': 60000,
  '5m': 300000,
  '11m': 660000,
}
