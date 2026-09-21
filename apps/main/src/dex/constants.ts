import { DEX_ROUTES } from '@evm-ui/shared/routes'

export const LARGE_RATE = 5000

const MAIN_ROUTE = {
  ...DEX_ROUTES,
  PAGE_DEPLOY_GAUGE: '/deploy-gauge',
  PAGE_LOCKER: '/locker',
  PAGE_INTEGRATIONS: '/integrations',
  PAGE_COMPENSATION: '/compensation',
  PAGE_404: '/404',
}

export const ROUTE = {
  ...MAIN_ROUTE,
  PAGE_LOCKER_CREATE: '/create',
  PAGE_LOCKER_ADJUST_CRV: '/adjust_crv',
  PAGE_LOCKER_ADJUST_DATE: '/adjust_date',
} as const

export const DEFAULT_NETWORK_CONFIG = {
  poolFilters: ['all', 'usd', 'btc', 'eth', 'crypto', 'crvusd', 'tricrypto', 'stableng', 'others', 'user'],
  swap: { fromAddress: '', toAddress: '' },
  swapCustomRouteRedirect: {},
  createQuickList: [],
  createDisabledTokens: [],
  stableswapFactory: false, // determines support in pool creation and gauge deployment
  stableswapFactoryOld: false, // determines support in pool creation and gauge deployment
  twocryptoFactoryOld: false, // determines support in pool creation and gauge deployment
  twocryptoFactory: false, // determines support in pool creation and gauge deployment
  tricryptoFactory: false, // determines support in pool creation and gauge deployment
  fxswapFactory: false, // determines support in pool creation and gauge deployment
  hasFactory: false,
}

// List of characters that are not allowed in pool names. See getPoolName() in @curvefi/api
export const INVALID_POOLS_NAME_CHARACTERS = [':'] as const satisfies string[]
