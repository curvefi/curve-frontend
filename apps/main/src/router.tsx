import { createRootRoute, createRoute, createRouter } from '@tanstack/react-router'
import { lazy } from 'react'
import Layout from './app/layout'
import { getNetworkDefs } from '@/dex/lib/networks'

// Create root route
const rootRoute = createRootRoute({
  loader: async () => {
    const networks = await getNetworkDefs()
    const preferredScheme = null // Handle client-side
    return { networks, preferredScheme }
  },
  component: () => {
    const { networks, preferredScheme } = rootRoute.useLoaderData()
    return <Layout networks={networks} preferredScheme={preferredScheme} />
  },
})

// Home page
const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: lazy(() => import('./app/page')),
})

// crvUSD routes
const crvusdRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/crvusd',
  component: lazy(() => import('./app/crvusd/page')),
})

const crvusdNetworkDisclaimerRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/crvusd/$network/disclaimer',
  component: lazy(() => import('./app/crvusd/[network]/disclaimer/page')),
})

const crvusdNetworkIntegrationsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/crvusd/$network/integrations',
  component: lazy(() => import('./app/crvusd/[network]/integrations/page')),
})

const crvusdNetworkMarketsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/crvusd/$network/markets',
  component: lazy(() => import('./app/crvusd/[network]/markets/page')),
})

const crvusdNetworkMarketCreateRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/crvusd/$network/markets/$collateralId/create/$formType',
  component: lazy(() => import('./app/crvusd/[network]/markets/[collateralId]/create/[[...formType]]/page')),
})

const crvusdNetworkMarketCreateNoFormTypeRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/crvusd/$network/markets/$collateralId/create',
  component: lazy(() => import('./app/crvusd/[network]/markets/[collateralId]/create/[[...formType]]/page')),
})

const crvusdNetworkMarketManageRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/crvusd/$network/markets/$collateralId/manage/$formType',
  component: lazy(() => import('./app/crvusd/[network]/markets/[collateralId]/manage/[[...formType]]/page')),
})

const crvusdNetworkMarketManageNoFormTypeRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/crvusd/$network/markets/$collateralId/manage',
  component: lazy(() => import('./app/crvusd/[network]/markets/[collateralId]/manage/[[...formType]]/page')),
})

const crvusdNetworkPegkeepersRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/crvusd/$network/pegkeepers',
  component: lazy(() => import('./app/crvusd/[network]/pegkeepers/page')),
})

const crvusdNetworkScrvUSDRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/crvusd/$network/scrvUSD',
  component: lazy(() => import('./app/crvusd/[network]/scrvUSD/page')),
})

// DAO routes
const daoRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/dao',
  component: lazy(() => import('./app/dao/page')),
})

const daoNetworkAnalyticsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/dao/$network/analytics',
  component: lazy(() => import('./app/dao/[network]/analytics/page')),
})

const daoNetworkDisclaimerRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/dao/$network/disclaimer',
  component: lazy(() => import('./app/dao/[network]/disclaimer/page')),
})

const daoNetworkGaugesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/dao/$network/gauges',
  component: lazy(() => import('./app/dao/[network]/gauges/page')),
})

const daoNetworkGaugeDetailRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/dao/$network/gauges/$gaugeAddress',
  component: lazy(() => import('./app/dao/[network]/gauges/[gaugeAddress]/page')),
})

const daoNetworkProposalsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/dao/$network/proposals',
  component: lazy(() => import('./app/dao/[network]/proposals/page')),
})

const daoNetworkProposalDetailRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/dao/$network/proposals/$proposalId',
  component: lazy(() => import('./app/dao/[network]/proposals/[proposalId]/page')),
})

const daoNetworkUserRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/dao/$network/user/$userAddress',
  component: lazy(() => import('./app/dao/[network]/user/[userAddress]/page')),
})

const daoNetworkVecrvRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/dao/$network/vecrv/$formType',
  component: lazy(() => import('./app/dao/[network]/vecrv/[[...formType]]/page')),
})

const daoNetworkVecrvNoFormTypeRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/dao/$network/vecrv',
  component: lazy(() => import('./app/dao/[network]/vecrv/[[...formType]]/page')),
})

// DEX routes
const dexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/dex',
  component: lazy(() => import('./app/dex/page')),
})

const dexNetworkCompensationRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/dex/$network/compensation',
  component: lazy(() => import('./app/dex/[network]/compensation/page')),
})

const dexNetworkCreatePoolRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/dex/$network/create-pool',
  component: lazy(() => import('./app/dex/[network]/create-pool/page')),
})

const dexNetworkDashboardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/dex/$network/dashboard',
  component: lazy(() => import('./app/dex/[network]/dashboard/page')),
})

const dexNetworkDeployGaugeRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/dex/$network/deploy-gauge',
  component: lazy(() => import('./app/dex/[network]/deploy-gauge/page')),
})

const dexNetworkDisclaimerRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/dex/$network/disclaimer',
  component: lazy(() => import('./app/dex/[network]/disclaimer/page')),
})

const dexNetworkIntegrationsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/dex/$network/integrations',
  component: lazy(() => import('./app/dex/[network]/integrations/page')),
})

const dexNetworkPoolsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/dex/$network/pools',
  component: lazy(() => import('./app/dex/[network]/pools/page')),
})

const dexNetworkPoolDetailRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/dex/$network/pools/$pool/$formType',
  component: lazy(() => import('./app/dex/[network]/pools/[pool]/[[...formType]]/page')),
})

const dexNetworkPoolDetailNoFormTypeRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/dex/$network/pools/$pool',
  component: lazy(() => import('./app/dex/[network]/pools/[pool]/[[...formType]]/page')),
})

const dexNetworkSwapRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/dex/$network/swap',
  component: lazy(() => import('./app/dex/[network]/swap/page')),
})

// Lend routes
const lendRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/lend',
  component: lazy(() => import('./app/lend/page')),
})

const lendNetworkDisclaimerRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/lend/$network/disclaimer',
  component: lazy(() => import('./app/lend/[network]/disclaimer/page')),
})

const lendNetworkIntegrationsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/lend/$network/integrations',
  component: lazy(() => import('./app/lend/[network]/integrations/page')),
})

const lendNetworkMarketsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/lend/$network/markets',
  component: lazy(() => import('./app/lend/[network]/markets/page')),
})

const lendNetworkMarketCreateRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/lend/$network/markets/$market/create/$formType',
  component: lazy(() => import('./app/lend/[network]/markets/[market]/create/[[...formType]]/page')),
})

const lendNetworkMarketCreateNoFormTypeRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/lend/$network/markets/$market/create',
  component: lazy(() => import('./app/lend/[network]/markets/[market]/create/[[...formType]]/page')),
})

const lendNetworkMarketManageRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/lend/$network/markets/$market/manage/$formType',
  component: lazy(() => import('./app/lend/[network]/markets/[market]/manage/[[...formType]]/page')),
})

const lendNetworkMarketManageNoFormTypeRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/lend/$network/markets/$market/manage',
  component: lazy(() => import('./app/lend/[network]/markets/[market]/manage/[[...formType]]/page')),
})

const lendNetworkMarketVaultRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/lend/$network/markets/$market/vault/$formType',
  component: lazy(() => import('./app/lend/[network]/markets/[market]/vault/[[...formType]]/page')),
})

const lendNetworkMarketVaultNoFormTypeRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/lend/$network/markets/$market/vault',
  component: lazy(() => import('./app/lend/[network]/markets/[market]/vault/[[...formType]]/page')),
})

// LlamaLend routes
const llamalendNetworkDisclaimerRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/llamalend/$network/disclaimer',
  component: lazy(() => import('./app/llamalend/[network]/disclaimer/page')),
})

const llamalendNetworkIntegrationsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/llamalend/$network/integrations',
  component: lazy(() => import('./app/llamalend/[network]/integrations/page')),
})

const llamalendNetworkMarketsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/llamalend/$network/markets',
  component: lazy(() => import('./app/llamalend/[network]/markets/page')),
})

// Catch-all route
const notFoundRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '*',
  component: lazy(() => import('./app/not-found')),
})

// Create the route tree
const routeTree = rootRoute.addChildren([
  indexRoute,
  // crvUSD routes
  crvusdRoute,
  crvusdNetworkDisclaimerRoute,
  crvusdNetworkIntegrationsRoute,
  crvusdNetworkMarketsRoute,
  crvusdNetworkMarketCreateRoute,
  crvusdNetworkMarketCreateNoFormTypeRoute,
  crvusdNetworkMarketManageRoute,
  crvusdNetworkMarketManageNoFormTypeRoute,
  crvusdNetworkPegkeepersRoute,
  crvusdNetworkScrvUSDRoute,
  // DAO routes
  daoRoute,
  daoNetworkAnalyticsRoute,
  daoNetworkDisclaimerRoute,
  daoNetworkGaugesRoute,
  daoNetworkGaugeDetailRoute,
  daoNetworkProposalsRoute,
  daoNetworkProposalDetailRoute,
  daoNetworkUserRoute,
  daoNetworkVecrvRoute,
  daoNetworkVecrvNoFormTypeRoute,
  // DEX routes
  dexRoute,
  dexNetworkCompensationRoute,
  dexNetworkCreatePoolRoute,
  dexNetworkDashboardRoute,
  dexNetworkDeployGaugeRoute,
  dexNetworkDisclaimerRoute,
  dexNetworkIntegrationsRoute,
  dexNetworkPoolsRoute,
  dexNetworkPoolDetailRoute,
  dexNetworkPoolDetailNoFormTypeRoute,
  dexNetworkSwapRoute,
  // Lend routes
  lendRoute,
  lendNetworkDisclaimerRoute,
  lendNetworkIntegrationsRoute,
  lendNetworkMarketsRoute,
  lendNetworkMarketCreateRoute,
  lendNetworkMarketCreateNoFormTypeRoute,
  lendNetworkMarketManageRoute,
  lendNetworkMarketManageNoFormTypeRoute,
  lendNetworkMarketVaultRoute,
  lendNetworkMarketVaultNoFormTypeRoute,
  // LlamaLend routes
  llamalendNetworkDisclaimerRoute,
  llamalendNetworkIntegrationsRoute,
  llamalendNetworkMarketsRoute,
  // Catch-all
  notFoundRoute,
])

// Create the router
export const router = createRouter({
  routeTree,
  defaultPreload: 'intent',
  defaultPreloadStaleTime: 0,
})

// Register router for type safety
declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}