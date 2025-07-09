import { createRootRoute, createRoute, createRouter, Outlet } from '@tanstack/react-router'
import { lazy, Suspense } from 'react'
import { getNetworkDefs } from '@/dex/lib/networks'
import { ClientWrapper } from '@/app/ClientWrapper.tsx'
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools'
import CrvUsdLayout from '@/app/crvusd/layout'
import DaoLayout from '@/app/dao/layout'
import DexLayout from '@/app/dex/layout'
import LendLayout from '@/app/lend/layout'

// Create root route
const rootRoute = createRootRoute({
  loader: async () => {
    const networks = await getNetworkDefs()
    const preferredScheme = null // Handle client-side
    return { networks, preferredScheme }
  },
  component: () => {
    const { networks, preferredScheme } = rootRoute.useLoaderData()
    return (
      <ClientWrapper networks={networks} preferredScheme={preferredScheme}>
        <Outlet />
        <TanStackRouterDevtools />
      </ClientWrapper>
    )
  },
  notFoundComponent: lazy(() => import('./app/not-found')),
})

// Home page
const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: lazy(() => import('./app/page')),
})

// crvUSD layout route
const crvusdLayoutRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: 'crvusd',
  component: () => (
    <CrvUsdLayout>
      <Outlet />
    </CrvUsdLayout>
  ),
})

// crvUSD routes
const crvusdRoute = createRoute({
  getParentRoute: () => crvusdLayoutRoute,
  path: '/',
  component: lazy(() => import('./app/crvusd/page')),
})

const crvusdNetworkDisclaimerRoute = createRoute({
  getParentRoute: () => crvusdLayoutRoute,
  path: '$network/disclaimer',
  component: lazy(() => import('./app/crvusd/[network]/disclaimer/page')),
})

const crvusdNetworkIntegrationsRoute = createRoute({
  getParentRoute: () => crvusdLayoutRoute,
  path: '$network/integrations',
  component: lazy(() => import('./app/crvusd/[network]/integrations/page')),
})

const crvusdNetworkMarketsRoute = createRoute({
  getParentRoute: () => crvusdLayoutRoute,
  path: '$network/markets',
  component: lazy(() => import('./app/crvusd/[network]/markets/page')),
})

const crvusdNetworkMarketCreateRoute = createRoute({
  getParentRoute: () => crvusdLayoutRoute,
  path: '$network/markets/$collateralId/create/$formType',
  component: lazy(() => import('./app/crvusd/[network]/markets/[collateralId]/create/[[...formType]]/page')),
})

const crvusdNetworkMarketCreateNoFormTypeRoute = createRoute({
  getParentRoute: () => crvusdLayoutRoute,
  path: '$network/markets/$collateralId/create',
  component: lazy(() => import('./app/crvusd/[network]/markets/[collateralId]/create/[[...formType]]/page')),
})

const crvusdNetworkMarketManageRoute = createRoute({
  getParentRoute: () => crvusdLayoutRoute,
  path: '$network/markets/$collateralId/manage/$formType',
  component: lazy(() => import('./app/crvusd/[network]/markets/[collateralId]/manage/[[...formType]]/page')),
})

const crvusdNetworkMarketManageNoFormTypeRoute = createRoute({
  getParentRoute: () => crvusdLayoutRoute,
  path: '$network/markets/$collateralId/manage',
  component: lazy(() => import('./app/crvusd/[network]/markets/[collateralId]/manage/[[...formType]]/page')),
})

const crvusdNetworkPegkeepersRoute = createRoute({
  getParentRoute: () => crvusdLayoutRoute,
  path: '$network/pegkeepers',
  component: lazy(() => import('./app/crvusd/[network]/pegkeepers/page')),
})

const crvusdNetworkScrvUSDRoute = createRoute({
  getParentRoute: () => crvusdLayoutRoute,
  path: '$network/scrvUSD',
  component: lazy(() => import('./app/crvusd/[network]/scrvUSD/page')),
})

// DAO layout route
const daoLayoutRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: 'dao',
  component: () => (
    <DaoLayout>
      <Outlet />
    </DaoLayout>
  ),
})

// DAO routes
const daoRoute = createRoute({
  getParentRoute: () => daoLayoutRoute,
  path: '/',
  component: lazy(() => import('./app/dao/page')),
})

const daoNetworkAnalyticsRoute = createRoute({
  getParentRoute: () => daoLayoutRoute,
  path: '$network/analytics',
  component: lazy(() => import('./app/dao/[network]/analytics/page')),
})

const daoNetworkDisclaimerRoute = createRoute({
  getParentRoute: () => daoLayoutRoute,
  path: '$network/disclaimer',
  component: lazy(() => import('./app/dao/[network]/disclaimer/page')),
})

const daoNetworkGaugesRoute = createRoute({
  getParentRoute: () => daoLayoutRoute,
  path: '$network/gauges',
  component: lazy(() => import('./app/dao/[network]/gauges/page')),
})

const daoNetworkGaugeDetailRoute = createRoute({
  getParentRoute: () => daoLayoutRoute,
  path: '$network/gauges/$gaugeAddress',
  component: lazy(() => import('./app/dao/[network]/gauges/[gaugeAddress]/page')),
})

const daoNetworkProposalsRoute = createRoute({
  getParentRoute: () => daoLayoutRoute,
  path: '$network/proposals',
  component: lazy(() => import('./app/dao/[network]/proposals/page')),
})

const daoNetworkProposalDetailRoute = createRoute({
  getParentRoute: () => daoLayoutRoute,
  path: '$network/proposals/$proposalId',
  component: lazy(() => import('./app/dao/[network]/proposals/[proposalId]/page')),
})

const daoNetworkUserRoute = createRoute({
  getParentRoute: () => daoLayoutRoute,
  path: '$network/user/$userAddress',
  component: lazy(() => import('./app/dao/[network]/user/[userAddress]/page')),
})

const daoNetworkVecrvRoute = createRoute({
  getParentRoute: () => daoLayoutRoute,
  path: '$network/vecrv/$formType',
  component: lazy(() => import('./app/dao/[network]/vecrv/[[...formType]]/page')),
})

const daoNetworkVecrvNoFormTypeRoute = createRoute({
  getParentRoute: () => daoLayoutRoute,
  path: '$network/vecrv',
  component: lazy(() => import('./app/dao/[network]/vecrv/[[...formType]]/page')),
})

// DEX layout route
const dexLayoutRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: 'dex',
  component: () => (
    <DexLayout>
      <Outlet />
    </DexLayout>
  ),
})

// DEX routes
const dexRoute = createRoute({
  getParentRoute: () => dexLayoutRoute,
  path: '/',
  component: lazy(() => import('./app/dex/page')),
})

const dexNetworkCompensationRoute = createRoute({
  getParentRoute: () => dexLayoutRoute,
  path: '$network/compensation',
  component: lazy(() => import('./app/dex/[network]/compensation/page')),
})

const dexNetworkCreatePoolRoute = createRoute({
  getParentRoute: () => dexLayoutRoute,
  path: '$network/create-pool',
  component: lazy(() => import('./app/dex/[network]/create-pool/page')),
})

const dexNetworkDashboardRoute = createRoute({
  getParentRoute: () => dexLayoutRoute,
  path: '$network/dashboard',
  component: lazy(() => import('./app/dex/[network]/dashboard/page')),
})

const dexNetworkDeployGaugeRoute = createRoute({
  getParentRoute: () => dexLayoutRoute,
  path: '$network/deploy-gauge',
  component: lazy(() => import('./app/dex/[network]/deploy-gauge/page')),
})

const dexNetworkDisclaimerRoute = createRoute({
  getParentRoute: () => dexLayoutRoute,
  path: '$network/disclaimer',
  component: lazy(() => import('./app/dex/[network]/disclaimer/page')),
})

const dexNetworkIntegrationsRoute = createRoute({
  getParentRoute: () => dexLayoutRoute,
  path: '$network/integrations',
  component: lazy(() => import('./app/dex/[network]/integrations/page')),
})

const dexNetworkPoolsRoute = createRoute({
  getParentRoute: () => dexLayoutRoute,
  path: '$network/pools',
  component: lazy(() => import('./app/dex/[network]/pools/page')),
})

const dexNetworkPoolDetailRoute = createRoute({
  getParentRoute: () => dexLayoutRoute,
  path: '$network/pools/$pool/$formType',
  component: lazy(() => import('./app/dex/[network]/pools/[pool]/[[...formType]]/page')),
})

const dexNetworkPoolDetailNoFormTypeRoute = createRoute({
  getParentRoute: () => dexLayoutRoute,
  path: '$network/pools/$pool',
  component: lazy(() => import('./app/dex/[network]/pools/[pool]/[[...formType]]/page')),
})

const dexNetworkSwapRoute = createRoute({
  getParentRoute: () => dexLayoutRoute,
  path: '$network/swap',
  component: lazy(() => import('./app/dex/[network]/swap/page')),
})

// Lend layout route
const lendLayoutRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: 'lend',
  component: () => (
    <LendLayout>
      <Outlet />
    </LendLayout>
  ),
})

// Lend routes
const lendRoute = createRoute({
  getParentRoute: () => lendLayoutRoute,
  path: '/',
  component: lazy(() => import('./app/lend/page')),
})

const lendNetworkDisclaimerRoute = createRoute({
  getParentRoute: () => lendLayoutRoute,
  path: '$network/disclaimer',
  component: lazy(() => import('./app/lend/[network]/disclaimer/page')),
})

const lendNetworkIntegrationsRoute = createRoute({
  getParentRoute: () => lendLayoutRoute,
  path: '$network/integrations',
  component: lazy(() => import('./app/lend/[network]/integrations/page')),
})

const lendNetworkMarketsRoute = createRoute({
  getParentRoute: () => lendLayoutRoute,
  path: '$network/markets',
  component: lazy(() => import('./app/lend/[network]/markets/page')),
})

const lendNetworkMarketCreateRoute = createRoute({
  getParentRoute: () => lendLayoutRoute,
  path: '$network/markets/$market/create/$formType',
  component: lazy(() => import('./app/lend/[network]/markets/[market]/create/[[...formType]]/page')),
})

const lendNetworkMarketCreateNoFormTypeRoute = createRoute({
  getParentRoute: () => lendLayoutRoute,
  path: '$network/markets/$market/create',
  component: lazy(() => import('./app/lend/[network]/markets/[market]/create/[[...formType]]/page')),
})

const lendNetworkMarketManageRoute = createRoute({
  getParentRoute: () => lendLayoutRoute,
  path: '$network/markets/$market/manage/$formType',
  component: lazy(() => import('./app/lend/[network]/markets/[market]/manage/[[...formType]]/page')),
})

const lendNetworkMarketManageNoFormTypeRoute = createRoute({
  getParentRoute: () => lendLayoutRoute,
  path: '$network/markets/$market/manage',
  component: lazy(() => import('./app/lend/[network]/markets/[market]/manage/[[...formType]]/page')),
})

const lendNetworkMarketVaultRoute = createRoute({
  getParentRoute: () => lendLayoutRoute,
  path: '$network/markets/$market/vault/$formType',
  component: lazy(() => import('./app/lend/[network]/markets/[market]/vault/[[...formType]]/page')),
})

const lendNetworkMarketVaultNoFormTypeRoute = createRoute({
  getParentRoute: () => lendLayoutRoute,
  path: '$network/markets/$market/vault',
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

// Add children to layout routes
crvusdLayoutRoute.addChildren([
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
])

daoLayoutRoute.addChildren([
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
])

dexLayoutRoute.addChildren([
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
])

lendLayoutRoute.addChildren([
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
])

// Create the route tree
const routeTree = rootRoute.addChildren([
  indexRoute,
  crvusdLayoutRoute,
  daoLayoutRoute,
  dexLayoutRoute,
  lendLayoutRoute,
  // LlamaLend routes (no layout yet)
  llamalendNetworkDisclaimerRoute,
  llamalendNetworkIntegrationsRoute,
  llamalendNetworkMarketsRoute,
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
