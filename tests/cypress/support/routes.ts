import { recordValues } from '@curvefi/prices-api/objects.util'
import { oneAddress, oneOf, oneValueOf } from '@cy/support/generators'
import { type AppPath, oneAppPath } from '@cy/support/ui'
import { LEND_MARKET_ROUTES } from '@ui-kit/shared/routes'
import {
  CRVUSD_ROUTES,
  DAO_ROUTES,
  DEX_ROUTES,
  LEND_ROUTES,
  LLAMALEND_ROUTES,
  PAGE_INTEGRATIONS,
  PAGE_LEGAL,
} from '@ui-kit/shared/routes'

const SDOLA_LEND_POOL = '0xaD444663c6C92B497225c6cE65feE2E7F78BFb86'

/**
 * Returns a random app route for testing. Excludes redirect routes.
 */
export const oneAppRoute = () =>
  ({
    dex: () => `dex/ethereum${oneValueOf(DEX_ROUTES)}`,
    lend: () =>
      `lend/ethereum${oneOf(
        ...recordValues(LEND_ROUTES).map((r) =>
          r == LEND_ROUTES.PAGE_MARKETS
            ? // use market detail page, the list page redirects to the llamalend app
              `${LEND_ROUTES.PAGE_MARKETS}/${SDOLA_LEND_POOL}${oneValueOf(LEND_MARKET_ROUTES)}`
            : r,
        ),
      )}`,
    crvusd: () =>
      `crvusd/ethereum${oneOf(
        ...recordValues(CRVUSD_ROUTES).map((r) =>
          // use market detail page, the list page redirects to the llamalend app
          r == CRVUSD_ROUTES.PAGE_MARKETS ? `${CRVUSD_ROUTES.PAGE_MARKETS}/WBTC` : r,
        ),
      )}`,
    llamalend: () => `llamalend/ethereum${oneValueOf(LLAMALEND_ROUTES)}`,
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

export const DEFAULT_PAGES = {
  dex: ['dex', DEX_ROUTES.PAGE_SWAP],
  dao: ['dao', DAO_ROUTES.PAGE_PROPOSALS],
  crvusd: ['llamalend', CRVUSD_ROUTES.PAGE_MARKETS],
  lend: ['llamalend', LEND_ROUTES.PAGE_MARKETS],
  llamalend: ['llamalend', LLAMALEND_ROUTES.PAGE_MARKETS],
} as const

const COMMON_ROUTE_TEST_IDS = { [PAGE_LEGAL]: 'legal-page', [PAGE_INTEGRATIONS]: 'integrations-page' }

const ROUTE_TEST_IDS = {
  dex: {
    [DEX_ROUTES.PAGE_POOLS]: 'data-table-head',
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
    [CRVUSD_ROUTES.PAGE_MARKETS]: 'btn-connect-prompt',
    ...COMMON_ROUTE_TEST_IDS,
  },
  lend: { [LEND_ROUTES.PAGE_MARKETS]: 'btn-connect-prompt', ...COMMON_ROUTE_TEST_IDS },
  llamalend: { [LLAMALEND_ROUTES.PAGE_MARKETS]: 'data-table-head', ...COMMON_ROUTE_TEST_IDS },
}

/**
 * Gets the test id for a given route, used to determine if the page has loaded
 */
export const getRouteTestId = (route: AppRoute) => {
  const app = getRouteApp(route)
  const appRoutes = ROUTE_TEST_IDS[app]
  const afterNetwork = route.replace(/^\w+\/ethereum/, '') // extract part after /{app}/{network}
  if (!afterNetwork) throw new Error(`Could not extract route after network from ${route}`)
  const [, testId] = Object.entries(appRoutes).find(([route]) => afterNetwork.startsWith(route)) ?? []
  if (!testId) throw new Error(`No test-id mapping for ${app} → ${afterNetwork}. Found: ${Object.keys(appRoutes)}`)
  return testId
}
