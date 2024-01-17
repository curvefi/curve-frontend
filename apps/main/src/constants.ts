export const NETWORK_TOKEN = '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee'
export const INVALID_ADDRESS = '0x0000000000000000000000000000000000000000'

export const WS_ADDRESS = 'wss://prices.curve.fi/v1/stream/ws'
export const LARGE_APY = 5000000

export const ROUTE = {
  PAGE_DASHBOARD: '/dashboard',
  PAGE_LOCKER: '/locker',
  PAGE_LOCKER_CREATE: '/create',
  PAGE_LOCKER_ADJUST_CRV: '/adjust_crv',
  PAGE_LOCKER_ADJUST_DATE: '/adjust_date',
  PAGE_POOLS: '/pools',
  PAGE_POOL_DEPOSIT: '/deposit',
  PAGE_SWAP: '/swap',
  PAGE_CREATE_POOL: '/create-pool',
  PAGE_DEPLOY_GAUGE: '/deploy-gauge',
  PAGE_POOL_WITHDRAW: '/withdraw',
  PAGE_INTEGRATIONS: '/integrations',
  PAGE_404: '/404',
  PAGE_COMPENSATION: '/compensation',
} as const

export const REFRESH_INTERVAL = {
  '1m': 60000,
  '5m': 300000,
  '11m': 660000,
}
