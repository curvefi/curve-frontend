import { recordValues } from '@curvefi/prices-api/objects.util'
import { oneAddress, oneOf } from '@cy/support/generators'
import { type AppPath, oneAppPath } from '@cy/support/ui'
import {
  CRVUSD_ROUTES,
  DAO_ROUTES,
  DEX_ROUTES,
  LEND_ROUTES,
  LLAMALEND_ROUTES,
  PAGE_INTEGRATIONS,
  PAGE_LEGAL,
} from '@ui-kit/shared/routes'

/**
 * Returns a random app route for testing
 */
export const oneAppRoute = () =>
  ({
    dex: () => `dex/ethereum${oneOf(...recordValues(DEX_ROUTES))}`,
    lend: () => `lend/ethereum${oneOf(...recordValues(LEND_ROUTES))}`,
    crvusd: () => `crvusd/ethereum${oneOf(...recordValues(CRVUSD_ROUTES))}`,
    llamalend: () => `llamalend/ethereum${oneOf(...recordValues(LLAMALEND_ROUTES))}`,
    dao: () =>
      `dao/ethereum${oneOf(
        ...recordValues({ ...DAO_ROUTES, PAGE_USER: `${DAO_ROUTES.PAGE_USER}/${oneAddress()}` }).filter(
          // exclude external links, hide the integrations page which redirects to the dex app
          (route) => !route.startsWith('https://') && !route.includes(DAO_ROUTES.PAGE_INTEGRATIONS),
        ),
      )}`,
  })[oneAppPath() || 'dex']() as AppRoute
type AppName = Exclude<AppPath, ''>

export type AppRoute = `${AppName}/${string}`

/** Gets the app name from a given route */
export const getRouteApp = (route: AppRoute) => route.split('/')[0] as AppName

const COMMON_ROUTE_TEST_IDS = { [PAGE_LEGAL]: 'legal-page', [PAGE_INTEGRATIONS]: 'integrations-page' }

const ROUTE_TEST_IDS = {
  dex: {
    [DEX_ROUTES.PAGE_POOLS]: 'table-text-pools',
    [DEX_ROUTES.PAGE_SWAP]: 'swap-page',
    [DEX_ROUTES.PAGE_DASHBOARD]: 'dashboard-page',
    [DEX_ROUTES.PAGE_CREATE_POOL]: 'create-pool-page',
    [DEX_ROUTES.PAGE_DEPLOY_GAUGE]: 'deploy-gauge-page',
    [DEX_ROUTES.PAGE_COMPENSATION]: 'compensation-page',
    ...COMMON_ROUTE_TEST_IDS,
  },
  dao: {
    [DAO_ROUTES.PAGE_PROPOSALS]: 'proposal-title',
    [DAO_ROUTES.PAGE_GAUGES]: 'gauges-page',
    [DAO_ROUTES.PAGE_ANALYTICS]: 'analytics-page',
    [DAO_ROUTES.PAGE_VECRV_CREATE]: 'vecrv-page',
    [DAO_ROUTES.PAGE_VECRV]: 'vecrv-page',
    [DAO_ROUTES.PAGE_USER]: 'user-page',
    ...COMMON_ROUTE_TEST_IDS,
  },
  crvusd: {
    [CRVUSD_ROUTES.PAGE_PSR]: 'pegkeepers',
    [CRVUSD_ROUTES.PAGE_CRVUSD_STAKING]: 'scrvusd-page',
    [CRVUSD_ROUTES.PAGE_MARKETS]: 'data-table-head',
    ...COMMON_ROUTE_TEST_IDS,
  },
  llamalend: {
    [LLAMALEND_ROUTES.PAGE_MARKETS]: 'data-table-head',
    ...COMMON_ROUTE_TEST_IDS,
  },
  lend: {
    [LEND_ROUTES.PAGE_MARKETS]: 'data-table-head',
    ...COMMON_ROUTE_TEST_IDS,
  },
}

/**
 * Gets the test id for a given route, used to determine if the page has loaded
 */
export const getRouteTestId = (route: AppRoute) => {
  const app = getRouteApp(route)
  const appRoutes = ROUTE_TEST_IDS[app]
  const afterNetwork = `/${route.split('/').slice(2).join('/')}` as keyof typeof appRoutes
  const testId = appRoutes[afterNetwork]
  if (!testId) throw new Error(`No test-id mapping for ${app} → ${afterNetwork}. Found: ${Object.keys(appRoutes)}`)
  return testId
}
