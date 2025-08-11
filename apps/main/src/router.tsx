import { lazy } from 'react'
import { ClientWrapper } from '@/app/ClientWrapper.tsx'
import CrvUsdLayout from '@/app/crvusd/layout'
import DaoLayout from '@/app/dao/layout'
import DexLayout from '@/app/dex/layout'
import LendLayout from '@/app/lend/layout'
import { getNetworkDefs } from '@/dex/lib/networks'
import { createRootRoute, createRoute, createRouter, HeadContent, Outlet } from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools'

// Create root route
const rootRoute = createRootRoute({
  loader: async () => {
    const networks = await getNetworkDefs()
    const preferredScheme = null // Handle client-side. todo: delete the prop!
    return { networks, preferredScheme }
  },
  component: () => {
    const { networks, preferredScheme } = rootRoute.useLoaderData()
    return (
      <ClientWrapper networks={networks} preferredScheme={preferredScheme}>
        <HeadContent />
        <Outlet />
        <TanStackRouterDevtools />
      </ClientWrapper>
    )
  },
})

// Home page
const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: lazy(() => import('./app/page')),
  head: () => ({
    meta: [{ title: 'Curve.finance' }],
  }),
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
  head: () => ({
    meta: [{ title: 'crvUSD - Curve' }],
  }),
})

const crvusdNetworkDisclaimerRoute = createRoute({
  getParentRoute: () => crvusdLayoutRoute,
  path: '$network/disclaimer',
  component: lazy(() => import('./app/crvusd/[network]/disclaimer/page')),
  head: () => ({
    meta: [{ title: 'Risk Disclaimer - Curve' }],
  }),
})

const crvusdNetworkIntegrationsRoute = createRoute({
  getParentRoute: () => crvusdLayoutRoute,
  path: '$network/integrations',
  component: lazy(() => import('./app/crvusd/[network]/integrations/page')),
  head: () => ({
    meta: [{ title: 'Integrations - Curve' }],
  }),
})

const crvusdNetworkMarketsRoute = createRoute({
  getParentRoute: () => crvusdLayoutRoute,
  path: '$network/markets',
  component: lazy(() => import('./app/crvusd/[network]/markets/page')),
  head: () => ({
    meta: [{ title: 'Markets - Curve' }],
  }),
})

const crvusdNetworkMarketCreateRoute = createRoute({
  getParentRoute: () => crvusdLayoutRoute,
  path: '$network/markets/$collateralId/create/$formType',
  component: lazy(() => import('./app/crvusd/[network]/markets/[collateralId]/create/[[...formType]]/page')),
  head: ({ params }) => ({
    meta: [{ title: `Create - ${params.collateralId} - Curve` }],
  }),
})

const crvusdNetworkMarketCreateNoFormTypeRoute = createRoute({
  getParentRoute: () => crvusdLayoutRoute,
  path: '$network/markets/$collateralId/create',
  component: lazy(() => import('./app/crvusd/[network]/markets/[collateralId]/create/[[...formType]]/page')),
  head: ({ params }) => ({
    meta: [{ title: `Create - ${params.collateralId} - Curve` }],
  }),
})

const crvusdNetworkMarketManageRoute = createRoute({
  getParentRoute: () => crvusdLayoutRoute,
  path: '$network/markets/$collateralId/manage/$formType',
  component: lazy(() => import('./app/crvusd/[network]/markets/[collateralId]/manage/[[...formType]]/page')),
  head: ({ params }) => ({
    meta: [{ title: `Manage - ${params.collateralId} - Curve` }],
  }),
})

const crvusdNetworkMarketManageNoFormTypeRoute = createRoute({
  getParentRoute: () => crvusdLayoutRoute,
  path: '$network/markets/$collateralId/manage',
  component: lazy(() => import('./app/crvusd/[network]/markets/[collateralId]/manage/[[...formType]]/page')),
  head: ({ params }) => ({
    meta: [{ title: `Manage - ${params.collateralId} - Curve` }],
  }),
})

const crvusdNetworkPegkeepersRoute = createRoute({
  getParentRoute: () => crvusdLayoutRoute,
  path: '$network/psr',
  component: lazy(() => import('./app/crvusd/[network]/psr/page')),
  head: () => ({
    meta: [{ title: 'Peg Stability Reserves - Curve' }],
  }),
})

const crvusdNetworkScrvUSDRoute = createRoute({
  getParentRoute: () => crvusdLayoutRoute,
  path: '$network/scrvUSD',
  component: lazy(() => import('./app/crvusd/[network]/scrvUSD/page')),
  head: () => ({
    meta: [{ title: 'Savings crvUSD - Curve' }],
  }),
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
  head: () => ({
    meta: [{ title: 'DAO - Curve' }],
  }),
})

const daoNetworkAnalyticsRoute = createRoute({
  getParentRoute: () => daoLayoutRoute,
  path: '$network/analytics',
  component: lazy(() => import('./app/dao/[network]/analytics/page')),
  head: () => ({
    meta: [{ title: 'Analytics - Curve' }],
  }),
})

const daoNetworkDisclaimerRoute = createRoute({
  getParentRoute: () => daoLayoutRoute,
  path: '$network/disclaimer',
  component: lazy(() => import('./app/dao/[network]/disclaimer/page')),
  head: () => ({
    meta: [{ title: 'Risk Disclaimer - Curve' }],
  }),
})

const daoNetworkGaugesRoute = createRoute({
  getParentRoute: () => daoLayoutRoute,
  path: '$network/gauges',
  component: lazy(() => import('./app/dao/[network]/gauges/page')),
  head: () => ({
    meta: [{ title: 'Gauges - Curve' }],
  }),
})

const daoNetworkGaugeDetailRoute = createRoute({
  getParentRoute: () => daoLayoutRoute,
  path: '$network/gauges/$gaugeAddress',
  component: lazy(() => import('./app/dao/[network]/gauges/[gaugeAddress]/page')),
  head: ({ params }) => ({
    meta: [{ title: `Gauge - ${params.gaugeAddress} - Curve` }],
  }),
})

const daoNetworkProposalsRoute = createRoute({
  getParentRoute: () => daoLayoutRoute,
  path: '$network/proposals',
  component: lazy(() => import('./app/dao/[network]/proposals/page')),
  head: () => ({
    meta: [{ title: 'Proposals - Curve' }],
  }),
})

const daoNetworkProposalDetailRoute = createRoute({
  getParentRoute: () => daoLayoutRoute,
  path: '$network/proposals/$proposalId',
  component: lazy(() => import('./app/dao/[network]/proposals/[proposalId]/page')),
  head: ({ params }) => ({
    meta: [{ title: `Proposal - ${params.proposalId} - Curve` }],
  }),
})

const daoNetworkUserRoute = createRoute({
  getParentRoute: () => daoLayoutRoute,
  path: '$network/user/$userAddress',
  component: lazy(() => import('./app/dao/[network]/user/[userAddress]/page')),
  head: ({ params }) => ({
    meta: [{ title: `veCRV Holder - ${params.userAddress} - Curve` }],
  }),
})

const daoNetworkVecrvRoute = createRoute({
  getParentRoute: () => daoLayoutRoute,
  path: '$network/vecrv/$formType',
  component: lazy(() => import('./app/dao/[network]/vecrv/[[...formType]]/page')),
  head: () => ({
    meta: [{ title: 'CRV Locker - Curve' }],
  }),
})

const daoNetworkVecrvNoFormTypeRoute = createRoute({
  getParentRoute: () => daoLayoutRoute,
  path: '$network/vecrv',
  component: lazy(() => import('./app/dao/[network]/vecrv/[[...formType]]/page')),
  head: () => ({
    meta: [{ title: 'CRV Locker - Curve' }],
  }),
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
  head: () => ({
    meta: [{ title: 'DEX - Curve' }],
  }),
})

const dexNetworkCompensationRoute = createRoute({
  getParentRoute: () => dexLayoutRoute,
  path: '$network/compensation',
  component: lazy(() => import('./app/dex/[network]/compensation/page')),
  head: () => ({
    meta: [{ title: 'Compensation - Curve' }],
  }),
})

const dexNetworkCreatePoolRoute = createRoute({
  getParentRoute: () => dexLayoutRoute,
  path: '$network/create-pool',
  component: lazy(() => import('./app/dex/[network]/create-pool/page')),
  head: () => ({
    meta: [{ title: 'Create Pool - Curve' }],
  }),
})

const dexNetworkDashboardRoute = createRoute({
  getParentRoute: () => dexLayoutRoute,
  path: '$network/dashboard',
  component: lazy(() => import('./app/dex/[network]/dashboard/page')),
  head: () => ({
    meta: [{ title: 'Dashboard - Curve' }],
  }),
})

const dexNetworkDeployGaugeRoute = createRoute({
  getParentRoute: () => dexLayoutRoute,
  path: '$network/deploy-gauge',
  component: lazy(() => import('./app/dex/[network]/deploy-gauge/page')),
  head: () => ({
    meta: [{ title: 'Deploy Gauge - Curve' }],
  }),
})

const dexNetworkDisclaimerRoute = createRoute({
  getParentRoute: () => dexLayoutRoute,
  path: '$network/disclaimer',
  component: lazy(() => import('./app/dex/[network]/disclaimer/page')),
  head: () => ({
    meta: [{ title: 'Risk Disclaimer - Curve' }],
  }),
})

const dexNetworkIntegrationsRoute = createRoute({
  getParentRoute: () => dexLayoutRoute,
  path: '$network/integrations',
  component: lazy(() => import('./app/dex/[network]/integrations/page')),
  head: () => ({
    meta: [{ title: 'Integrations - Curve' }],
  }),
})

const dexNetworkPoolsRoute = createRoute({
  getParentRoute: () => dexLayoutRoute,
  path: '$network/pools',
  component: lazy(() => import('./app/dex/[network]/pools/page')),
  head: () => ({
    meta: [{ title: 'Pools - Curve' }],
  }),
})

const dexNetworkPoolDetailRoute = createRoute({
  getParentRoute: () => dexLayoutRoute,
  path: '$network/pools/$pool/$formType',
  component: lazy(() => import('./app/dex/[network]/pools/[pool]/[[...formType]]/page')),
  head: ({ params }) => ({
    meta: [{ title: `Curve - Pool - ${params.pool} - Curve` }],
  }),
})

const dexNetworkPoolDetailNoFormTypeRoute = createRoute({
  getParentRoute: () => dexLayoutRoute,
  path: '$network/pools/$pool',
  component: lazy(() => import('./app/dex/[network]/pools/[pool]/[[...formType]]/page')),
  head: ({ params }) => ({
    meta: [{ title: `Curve - Pool - ${params.pool} - Curve` }],
  }),
})

const dexNetworkSwapRoute = createRoute({
  getParentRoute: () => dexLayoutRoute,
  path: '$network/swap',
  component: lazy(() => import('./app/dex/[network]/swap/page')),
  head: () => ({
    meta: [{ title: 'Swap - Curve' }],
  }),
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
  head: () => ({
    meta: [{ title: 'Lend - Curve' }],
  }),
})

const lendNetworkDisclaimerRoute = createRoute({
  getParentRoute: () => lendLayoutRoute,
  path: '$network/disclaimer',
  component: lazy(() => import('./app/lend/[network]/disclaimer/page')),
  head: () => ({
    meta: [{ title: 'Risk Disclaimer - Curve Lend' }],
  }),
})

const lendNetworkIntegrationsRoute = createRoute({
  getParentRoute: () => lendLayoutRoute,
  path: '$network/integrations',
  component: lazy(() => import('./app/lend/[network]/integrations/page')),
  head: () => ({
    meta: [{ title: 'Integrations - Curve Lend' }],
  }),
})

const lendNetworkMarketsRoute = createRoute({
  getParentRoute: () => lendLayoutRoute,
  path: '$network/markets',
  component: lazy(() => import('./app/lend/[network]/markets/page')),
  head: () => ({
    meta: [{ title: 'Markets - Curve Lend' }],
  }),
})

const lendNetworkMarketCreateRoute = createRoute({
  getParentRoute: () => lendLayoutRoute,
  path: '$network/markets/$market/create/$formType',
  component: lazy(() => import('./app/lend/[network]/markets/[market]/create/[[...formType]]/page')),
  head: ({ params }) => ({
    meta: [{ title: `${params.market} | Create Loan - Curve Lend` }],
  }),
})

const lendNetworkMarketCreateNoFormTypeRoute = createRoute({
  getParentRoute: () => lendLayoutRoute,
  path: '$network/markets/$market/create',
  component: lazy(() => import('./app/lend/[network]/markets/[market]/create/[[...formType]]/page')),
  head: ({ params }) => ({
    meta: [{ title: `${params.market} | Create Loan - Curve Lend` }],
  }),
})

const lendNetworkMarketManageRoute = createRoute({
  getParentRoute: () => lendLayoutRoute,
  path: '$network/markets/$market/manage/$formType',
  component: lazy(() => import('./app/lend/[network]/markets/[market]/manage/[[...formType]]/page')),
  head: ({ params }) => ({
    meta: [{ title: `${params.market} | Manage Loan - Curve Lend` }],
  }),
})

const lendNetworkMarketManageNoFormTypeRoute = createRoute({
  getParentRoute: () => lendLayoutRoute,
  path: '$network/markets/$market/manage',
  component: lazy(() => import('./app/lend/[network]/markets/[market]/manage/[[...formType]]/page')),
  head: ({ params }) => ({
    meta: [{ title: `${params.market} | Manage Loan - Curve Lend` }],
  }),
})

const lendNetworkMarketVaultRoute = createRoute({
  getParentRoute: () => lendLayoutRoute,
  path: '$network/markets/$market/vault/$formType',
  component: lazy(() => import('./app/lend/[network]/markets/[market]/vault/[[...formType]]/page')),
  head: ({ params }) => ({
    meta: [{ title: `${params.market} | Supply - Curve Lend` }],
  }),
})

const lendNetworkMarketVaultNoFormTypeRoute = createRoute({
  getParentRoute: () => lendLayoutRoute,
  path: '$network/markets/$market/vault',
  component: lazy(() => import('./app/lend/[network]/markets/[market]/vault/[[...formType]]/page')),
  head: ({ params }) => ({
    meta: [{ title: `${params.market} | Supply - Curve Lend` }],
  }),
})

// LlamaLend routes
const llamalendNetworkDisclaimerRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/llamalend/$network/disclaimer',
  component: lazy(() => import('./app/llamalend/[network]/disclaimer/page')),
  head: () => ({
    meta: [{ title: 'Risk Disclaimer - Curve Llamalend' }],
  }),
})

const llamalendNetworkIntegrationsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/llamalend/$network/integrations',
  component: lazy(() => import('./app/llamalend/[network]/integrations/page')),
  head: () => ({
    meta: [{ title: 'Integrations - Curve Llamalend' }],
  }),
})

const llamalendNetworkMarketsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/llamalend/$network/markets',
  component: lazy(() => import('./app/llamalend/[network]/markets/page')),
  head: () => ({
    meta: [{ title: 'Llamalend Beta Markets - Curve' }],
  }),
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
  defaultNotFoundComponent: lazy(() => import('./app/not-found')),
})

// Register router for type safety
declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}
