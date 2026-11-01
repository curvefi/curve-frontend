import type { ReactNode } from 'react'
import { oneAddress, oneOf } from '@cy/support/generators'
import { type AppPath, oneAppPath } from '@cy/support/ui'
import { crvUsdPages, daoPages, dexPages, lendPages, llamalendRoutes } from '@evm-ui/shared/routes'
import { assert } from '@primitives/objects.utils'
import { createMemoryHistory, createRootRoute, createRoute, createRouter } from '@tanstack/react-router'

const WBTC_LEND_POOL = '0xcaD85b7fe52B1939DCEebEe9bCf0b2a5Aa0cE617'
const DEFAULT_NETWORK = 'ethereum'

export const CRVUSD_PAGE_MARKETS_ROUTE = `${crvUsdPages.markets({ blockchainId: DEFAULT_NETWORK })}/`

export const APP_ROUTES = {
  dex: () =>
    oneOf(
      dexPages.swap,
      dexPages.pools,
      dexPages.poolCreation,
      dexPages.gaugeDeployment,
      dexPages.compensation,
      dexPages.legal,
      dexPages.integrations,
    )({ blockchainId: DEFAULT_NETWORK }),
  lend: () =>
    // The market list redirects to llamalend, so visit a market instead.
    oneOf(
      lendPages.market,
      lendPages.vault,
      lendPages.legal,
      lendPages.integrations,
    )({ blockchainId: DEFAULT_NETWORK, marketId: WBTC_LEND_POOL }),
  crvusd: () =>
    oneOf(
      crvUsdPages.market,
      crvUsdPages.crvUsdStaking,
      crvUsdPages.psr,
      crvUsdPages.legal,
      crvUsdPages.integrations,
    )({ blockchainId: DEFAULT_NETWORK, collateralId: 'WBTC' }),
  llamalend: () =>
    oneOf(
      llamalendRoutes.markets,
      llamalendRoutes.legal,
      llamalendRoutes.integrations,
    )({ blockchainId: DEFAULT_NETWORK }),
  dao: () =>
    oneOf(
      daoPages.proposals,
      daoPages.gauges,
      daoPages.veCrv,
      daoPages.analytics,
      daoPages.user,
      daoPages.legal,
    )({ userAddress: oneAddress() }),
}

/**
 * Returns a random app route for testing. Excludes redirect routes.
 */
export const oneAppRoute = () => APP_ROUTES[oneAppPath() || 'dex']() as AppRoute
type AppName = Exclude<AppPath, ''>

export type AppRoute = `/${AppName}/${string}`

/** Gets the app name from a given route */
export const getRouteApp = (route: AppRoute) => route.split('/')[1] as AppName

export const DEFAULT_PAGES = {
  dex: ['dex', dexPages.swap],
  dao: ['dao', daoPages.proposals],
  crvusd: ['llamalend', llamalendRoutes.markets],
  lend: ['llamalend', llamalendRoutes.markets],
  llamalend: ['llamalend', llamalendRoutes.markets],
} as const

const COMMON_ROUTE_TEST_IDS = { '/legal': 'legal-page', '/integrations': 'integrations-page' }

const ROUTE_TEST_IDS = {
  dex: {
    '/pools': 'data-table-head',
    '/swap': 'swap-page',
    '/create-pool': 'create-pool-page',
    '/deploy-gauge': 'deploy-gauge-page',
    '/compensation': 'compensation-page',
    ...COMMON_ROUTE_TEST_IDS,
  },
  dao: {
    '/proposals': 'proposal-title',
    '/gauges': 'gauges-page',
    '/analytics': 'analytics-page',
    '/vecrv': 'vecrv-page',
    '/user': 'user-page',
    ...COMMON_ROUTE_TEST_IDS,
  },
  crvusd: {
    '/psr': 'pegkeepers',
    '/scrvUSD': 'scrvusd-page',
    '/markets': 'form-market-page',
    ...COMMON_ROUTE_TEST_IDS,
  },
  lend: { '/markets': 'form-market-page', ...COMMON_ROUTE_TEST_IDS },
  llamalend: { '/markets': 'data-table-head', ...COMMON_ROUTE_TEST_IDS },
}

/**
 * Gets the test id for a given route, used to determine if the page has loaded
 */
export const getRouteTestId = (route: AppRoute) => {
  const app = getRouteApp(route)
  const appRoutes = ROUTE_TEST_IDS[app]
  // extract part after /{app}/{network}
  const afterNetwork = assert(route.replace(/^\/\w+\/ethereum/, ''), `No route after network from ${route}`)
  const [, testId] = Object.entries(appRoutes).find(([route]) => afterNetwork.startsWith(route)) ?? []
  // eslint-disable-next-line @typescript-eslint/restrict-template-expressions -- Existing violation before enabling this rule.
  return assert(testId, `No test-id mapping for ${app} → ${afterNetwork}. Found: ${Object.keys(appRoutes)}`)
}

export const createComponentTestRouter = ({
  component,
  initialEntry,
  path,
}: {
  component: () => ReactNode
  initialEntry: string
  path: string
}) => {
  const rootRoute = createRootRoute()
  const componentRoute = createRoute({ getParentRoute: () => rootRoute, path, component })

  return createRouter({
    routeTree: rootRoute.addChildren([componentRoute]),
    history: createMemoryHistory({ initialEntries: [initialEntry] }),
  })
}
