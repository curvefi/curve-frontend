import { DEX_ROUTES } from '@ui-kit/shared/routes'

export const LARGE_APY = 5000

export const MAIN_ROUTE = {
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
  PAGE_POOL_DEPOSIT: '/deposit',
  PAGE_POOL_WITHDRAW: '/withdraw',
  PAGE_POOL_MANAGE: '/manage-gauge',
} as const

export const DEFAULT_NETWORK_CONFIG = {
  useApi: true, // default to true when calling fetchPools
  isLite: false,
  isActiveNetwork: true,
  missingPools: [],
  poolCustomTVL: {}, // hardcode tvl for pool
  poolFilters: ['all', 'usd', 'btc', 'eth', 'crypto', 'crvusd', 'tricrypto', 'stableng', 'others', 'user'],
  poolIsWrappedOnly: {}, // show only wrapped pool data
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
  fxswapFactory: false, // determines support in pool creation and gauge deployment
  hasFactory: false,
  pricesApi: false,
}

// List of characters that are not allowed in pool names. See getPoolName() in @curvefi/api
export const INVALID_POOLS_NAME_CHARACTERS = [':'] as const satisfies string[]

export const CROSS_CHAIN_ADDRESSES = [
  '0x939721ce04332ca04b100154e0c8fcbb4ebaf695',
  '0x228f20f430fd7a6f5b1abea69a5ab8eb2973853c',
  '0x6bb9a6b7066445da6bef268b91810ae750431587',
  '0x4df0b8323f7b6d45abf39ecbd3f18bd5fcbcb1b2',
  '0x6e0dc5a4ef555277db3435703f0e287040013763',
]
