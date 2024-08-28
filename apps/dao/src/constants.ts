export const NETWORK_TOKEN = '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee'

export const MAIN_ROUTE = {
  PAGE_PROPOSALS: '/proposals',
  PAGE_GAUGES: '/gauges',
  PAGE_VECRV: '/vecrv',
  PAGE_ANALYTICS: '/analytics',
  PAGE_USER: '/user',
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

// 7 days in seconds
export const SEVEN_DAYS = 604800

export const TOP_HOLDERS: Record<string, { address: string; title: string }> = {
  ['0x989aeb4d175e16225e39e87d0d97a3360524ad80']: {
    address: '0x989aeb4d175e16225e39e87d0d97a3360524ad80',
    title: 'Convex',
  },
  ['0xf147b8125d2ef93fb6965db97d6746952a133934']: {
    address: '0xf147b8125d2ef93fb6965db97d6746952a133934',
    title: 'Yearn',
  },
  ['0x52f541764e6e90eebc5c21ff570de0e2d63766b6']: {
    address: '0x52f541764e6e90eebc5c21ff570de0e2d63766b6',
    title: 'Stake DAO',
  },
}
