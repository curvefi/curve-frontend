import { SMALL_POOL_TVL } from '@ui-kit/features/user-profile/store'
import { DEX_ROUTES } from '@ui-kit/shared/routes'

export { CONNECT_STAGE } from '@ui/utils/utilsConnectState'

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

export const DEFAULT_NETWORK_CONFIG = {
  useApi: true, // default to true when calling fetchPools
  excludeTokensBalancesMapper: {}, // tokens that cause issues when getting wallet balances
  excludePoolsMapper: {}, // remove pool from pool list and pool page
  hideSmallPoolsTvl: SMALL_POOL_TVL,
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
