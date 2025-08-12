import { lazy } from 'react'
import DexLayout from '@/app/dex/layout'
import { redirectTo } from '@/routes/util'
import { createRoute, Outlet } from '@tanstack/react-router'
import { rootRoute } from './root.routes'

const dexRoute = createRoute({
  getParentRoute: () => dexLayoutRoute,
  path: '/',
  component: lazy(() => import('../app/dex/page')),
  head: () => ({
    meta: [{ title: 'DEX - Curve' }],
  }),
})

const dexNetworkRedirectRoute = createRoute({
  getParentRoute: () => dexLayoutRoute,
  path: '$network',
  loader: ({ params: { network } }) => redirectTo(`/dex/${network}/pools/`),
})

// Redirect routes
const dexIntegrationsRedirectRoute = createRoute({
  getParentRoute: () => dexLayoutRoute,
  path: '/integrations',
  loader: () => redirectTo('/dex/ethereum/integrations/'),
})

const dexNetworkCompensationRoute = createRoute({
  getParentRoute: () => dexLayoutRoute,
  path: '$network/compensation',
  component: lazy(() => import('../app/dex/[network]/compensation/page')),
  head: () => ({
    meta: [{ title: 'Compensation - Curve' }],
  }),
})

const dexNetworkCreatePoolRoute = createRoute({
  getParentRoute: () => dexLayoutRoute,
  path: '$network/create-pool',
  component: lazy(() => import('../app/dex/[network]/create-pool/page')),
  head: () => ({
    meta: [{ title: 'Create Pool - Curve' }],
  }),
})

const dexNetworkDashboardRoute = createRoute({
  getParentRoute: () => dexLayoutRoute,
  path: '$network/dashboard',
  component: lazy(() => import('../app/dex/[network]/dashboard/page')),
  head: () => ({
    meta: [{ title: 'Dashboard - Curve' }],
  }),
})

const dexNetworkDeployGaugeRoute = createRoute({
  getParentRoute: () => dexLayoutRoute,
  path: '$network/deploy-gauge',
  component: lazy(() => import('../app/dex/[network]/deploy-gauge/page')),
  head: () => ({
    meta: [{ title: 'Deploy Gauge - Curve' }],
  }),
})

const dexNetworkDisclaimerRoute = createRoute({
  getParentRoute: () => dexLayoutRoute,
  path: '$network/disclaimer',
  component: lazy(() => import('../app/dex/[network]/disclaimer/page')),
  head: () => ({
    meta: [{ title: 'Risk Disclaimer - Curve' }],
  }),
})

const dexNetworkIntegrationsRoute = createRoute({
  getParentRoute: () => dexLayoutRoute,
  path: '$network/integrations',
  component: lazy(() => import('../app/dex/[network]/integrations/page')),
  head: () => ({
    meta: [{ title: 'Integrations - Curve' }],
  }),
})

const dexNetworkPoolsRoute = createRoute({
  getParentRoute: () => dexLayoutRoute,
  path: '$network/pools',
  component: lazy(() => import('../app/dex/[network]/pools/page')),
  head: () => ({
    meta: [{ title: 'Pools - Curve' }],
  }),
})

const dexNetworkPoolDetailRoute = createRoute({
  getParentRoute: () => dexLayoutRoute,
  path: '$network/pools/$pool/$formType',
  component: lazy(() => import('../app/dex/[network]/pools/[pool]/[[...formType]]/page')),
  head: ({ params }) => ({
    meta: [{ title: `Curve - Pool - ${params.pool} - Curve` }],
  }),
})

const dexNetworkPoolDetailNoFormTypeRoute = createRoute({
  getParentRoute: () => dexLayoutRoute,
  path: '$network/pools/$pool',
  component: lazy(() => import('../app/dex/[network]/pools/[pool]/[[...formType]]/page')),
  head: ({ params }) => ({
    meta: [{ title: `Curve - Pool - ${params.pool} - Curve` }],
  }),
})

const dexNetworkSwapRoute = createRoute({
  getParentRoute: () => dexLayoutRoute,
  path: '$network/swap',
  component: lazy(() => import('../app/dex/[network]/swap/page')),
  head: () => ({
    meta: [{ title: 'Swap - Curve' }],
  }),
})

export const dexLayoutRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: 'dex',
  component: () => (
    <DexLayout>
      <Outlet />
    </DexLayout>
  ),
})

export const dexRoutes = dexLayoutRoute.addChildren([
  dexRoute,
  dexNetworkRedirectRoute,
  dexIntegrationsRedirectRoute,
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
