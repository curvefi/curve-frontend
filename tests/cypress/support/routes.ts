import type { ReactNode } from 'react'
import { oneAddress, oneOf, oneValueOf } from '@cy/support/generators'
import { type AppPath, oneAppPath } from '@cy/support/ui'
import {
  CRVUSD_ROUTES,
  DAO_ROUTES,
  DEX_ROUTES,
  LEND_ROUTES,
  LEND_MARKET_ROUTES,
  LLAMALEND_ROUTES,
} from '@evm-ui/shared/routes'
import { assert } from '@primitives/objects.utils'
import { createMemoryHistory, createRootRoute, createRoute, createRouter } from '@tanstack/react-router'
import { PAGE_INTEGRATIONS, PAGE_LEGAL } from '@ui/features/layout/routes'

const WBTC_LEND_POOL = '0xcaD85b7fe52B1939DCEebEe9bCf0b2a5Aa0cE617'
const DEFAULT_NETWORK = 'ethereum'

export const CRVUSD_PAGE_MARKETS_ROUTE = `${CRVUSD_ROUTES.PAGE_MARKETS({ blockchainId: DEFAULT_NETWORK })}/`.slice(1)

export const APP_ROUTES = {
  dex: () =>
    oneOf(
      DEX_ROUTES.PAGE_SWAP,
      DEX_ROUTES.PAGE_POOLS,
      DEX_ROUTES.PAGE_CREATE_POOL,
      DEX_ROUTES.PAGE_DEPLOY_GAUGE,
      DEX_ROUTES.PAGE_COMPENSATION,
      DEX_ROUTES.PAGE_LEGAL,
      DEX_ROUTES.PAGE_INTEGRATIONS,
    )({ blockchainId: DEFAULT_NETWORK }).slice(1),
  lend: () =>
    oneOf(
      // The market list redirects to llamalend, so visit a market instead.
      oneValueOf(LEND_MARKET_ROUTES)({ blockchainId: DEFAULT_NETWORK, marketId: WBTC_LEND_POOL }),
      LEND_ROUTES.PAGE_LEGAL({ blockchainId: DEFAULT_NETWORK }),
      LEND_ROUTES.PAGE_INTEGRATIONS({ blockchainId: DEFAULT_NETWORK }),
    ).slice(1),
  crvusd: () =>
    oneOf(
      CRVUSD_ROUTES.PAGE_MARKET({ blockchainId: DEFAULT_NETWORK, collateralId: 'WBTC' }),
      CRVUSD_ROUTES.PAGE_CRVUSD_STAKING({ blockchainId: DEFAULT_NETWORK }),
      CRVUSD_ROUTES.PAGE_PSR({ blockchainId: DEFAULT_NETWORK }),
      CRVUSD_ROUTES.PAGE_LEGAL({ blockchainId: DEFAULT_NETWORK }),
      CRVUSD_ROUTES.PAGE_INTEGRATIONS({ blockchainId: DEFAULT_NETWORK }),
    ).slice(1),
  llamalend: () =>
    oneOf(
      LLAMALEND_ROUTES.PAGE_MARKETS,
      LLAMALEND_ROUTES.PAGE_LEGAL,
      LLAMALEND_ROUTES.PAGE_INTEGRATIONS,
    )({ blockchainId: DEFAULT_NETWORK }).slice(1),
  dao: () =>
    oneOf(
      DAO_ROUTES.PAGE_PROPOSALS(),
      DAO_ROUTES.PAGE_GAUGES(),
      DAO_ROUTES.PAGE_VECRV(),
      DAO_ROUTES.PAGE_ANALYTICS(),
      DAO_ROUTES.PAGE_USER({ userAddress: oneAddress() }),
      DAO_ROUTES.PAGE_LEGAL(),
    ).slice(1),
}

/**
 * Returns a random app route for testing. Excludes redirect routes.
 */
export const oneAppRoute = () => APP_ROUTES[oneAppPath() || 'dex']() as AppRoute
type AppName = Exclude<AppPath, ''>

export type AppRoute = `${AppName}/${string}`

/** Gets the app name from a given route */
export const getRouteApp = (route: AppRoute) => route.split('/')[0] as AppName

export const DEFAULT_PAGES = {
  dex: ['dex', DEX_ROUTES.PAGE_SWAP],
  dao: ['dao', DAO_ROUTES.PAGE_PROPOSALS],
  crvusd: ['llamalend', LLAMALEND_ROUTES.PAGE_MARKETS],
  lend: ['llamalend', LLAMALEND_ROUTES.PAGE_MARKETS],
  llamalend: ['llamalend', LLAMALEND_ROUTES.PAGE_MARKETS],
} as const

const COMMON_ROUTE_TEST_IDS = { [PAGE_LEGAL]: 'legal-page', [PAGE_INTEGRATIONS]: 'integrations-page' }

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
  const afterNetwork = assert(route.replace(/^\w+\/ethereum/, ''), `No route after network from ${route}`)
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
