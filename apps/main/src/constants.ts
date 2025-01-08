import { DEX_ROUTES } from '@ui-kit/shared/routes'

export const NETWORK_TOKEN = '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee'
export const INVALID_ADDRESS = '0x0000000000000000000000000000000000000000'
export const LARGE_APY = 5000

export const MAIN_ROUTE = {
  ...DEX_ROUTES,
  PAGE_DEPLOY_GAUGE: '/deploy-gauge',
  PAGE_LOCKER: '/locker',
  PAGE_INTEGRATIONS: '/integrations',
  PAGE_COMPENSATION: '/compensation',
  PAGE_DISCLAIMER: '/disclaimer',
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

export const DEFAULT_NETWORK_CONFIG = {
  useApi: true, // default to true when calling fetchPools
  excludeTokensBalancesMapper: {}, // tokens that cause issues when getting wallet balances
  excludePoolsMapper: {}, // remove pool from pool list and pool page
  hideSmallPoolsTvl: 10000,
  isLite: false,
  isActiveNetwork: true,
  missingPools: [],
  poolCustomTVL: {}, // hardcode tvl for pool
  poolFilters: ['all', 'usd', 'btc', 'eth', 'crypto', 'crvusd', 'tricrypto', 'stableng', 'others', 'user'],
  poolIsWrappedOnly: {}, // show only wrapped pool data
  poolListFormValuesDefault: {},
  swap: { fromAddress: '', toAddress: '' },
  swapCustomRouteRedirect: {},
  showInSelectNetwork: true,
  showRouterSwap: true,
  createQuickList: [],
  createDisabledTokens: [],
  stableswapFactory: false, // determines support in pool creation and gauge deployment
  stableswapFactoryOld: false, // determines support in pool creation and gauge deployment
  twocryptoFactoryOld: false, // determines support in pool creation and gauge deployment
  twocryptoFactory: false, // determines support in pool creation and gauge deployment
  tricryptoFactory: false, // determines support in pool creation and gauge deployment
  hasFactory: false,
  pricesApi: false,
}
