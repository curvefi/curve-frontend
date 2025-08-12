import { lazy } from 'react'
import CrvUsdLayout from '@/app/crvusd/layout'
import { createRoute, Outlet } from '@tanstack/react-router'
import { rootRoute } from './root.routes'
import { redirectTo } from './util'

const crvusdLayoutRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: 'crvusd',
  component: () => (
    <CrvUsdLayout>
      <Outlet />
    </CrvUsdLayout>
  ),
})
const crvusdRoute = createRoute({
  getParentRoute: () => crvusdLayoutRoute,
  path: '/',
  component: lazy(() => import('../app/crvusd/page')),
  head: () => ({
    meta: [{ title: 'crvUSD - Curve' }],
  }),
})

const crvusdNetworkDisclaimerRoute = createRoute({
  getParentRoute: () => crvusdLayoutRoute,
  path: '$network/disclaimer',
  component: lazy(() => import('../app/crvusd/[network]/disclaimer/page')),
  head: () => ({
    meta: [{ title: 'Risk Disclaimer - Curve' }],
  }),
})

const crvusdNetworkIntegrationsRoute = createRoute({
  getParentRoute: () => crvusdLayoutRoute,
  path: '$network/integrations',
  component: lazy(() => import('../app/crvusd/[network]/integrations/page')),
  head: () => ({
    meta: [{ title: 'Integrations - Curve' }],
  }),
})

const crvusdNetworkMarketsRoute = createRoute({
  getParentRoute: () => crvusdLayoutRoute,
  path: '$network/markets',
  component: lazy(() => import('../app/crvusd/[network]/markets/page')),
  head: () => ({
    meta: [{ title: 'Markets - Curve' }],
  }),
})

const crvusdNetworkMarketCreateRoute = createRoute({
  getParentRoute: () => crvusdLayoutRoute,
  path: '$network/markets/$collateralId/create/$formType',
  component: lazy(() => import('../app/crvusd/[network]/markets/[collateralId]/create/[[...formType]]/page')),
  head: ({ params }) => ({
    meta: [{ title: `Create - ${params.collateralId} - Curve` }],
  }),
})

const crvusdNetworkMarketCreateNoFormTypeRoute = createRoute({
  getParentRoute: () => crvusdLayoutRoute,
  path: '$network/markets/$collateralId/create',
  component: lazy(() => import('../app/crvusd/[network]/markets/[collateralId]/create/[[...formType]]/page')),
  head: ({ params }) => ({
    meta: [{ title: `Create - ${params.collateralId} - Curve` }],
  }),
})

const crvusdNetworkMarketManageRoute = createRoute({
  getParentRoute: () => crvusdLayoutRoute,
  path: '$network/markets/$collateralId/manage/$formType',
  component: lazy(() => import('../app/crvusd/[network]/markets/[collateralId]/manage/[[...formType]]/page')),
  head: ({ params }) => ({
    meta: [{ title: `Manage - ${params.collateralId} - Curve` }],
  }),
})

const crvusdNetworkMarketManageNoFormTypeRoute = createRoute({
  getParentRoute: () => crvusdLayoutRoute,
  path: '$network/markets/$collateralId/manage',
  component: lazy(() => import('../app/crvusd/[network]/markets/[collateralId]/manage/[[...formType]]/page')),
  head: ({ params }) => ({
    meta: [{ title: `Manage - ${params.collateralId} - Curve` }],
  }),
})

const crvusdNetworkPsrRoute = createRoute({
  getParentRoute: () => crvusdLayoutRoute,
  path: '$network/psr',
  component: lazy(() => import('../app/crvusd/[network]/psr/page')),
  head: () => ({
    meta: [{ title: 'Peg Stability Reserves - Curve' }],
  }),
})

const crvusdNetworkPegkeepersRedirectRoute = createRoute({
  getParentRoute: () => crvusdLayoutRoute,
  path: '$network/pegkeepers',
  loader: ({ params: { network } }) => redirectTo(`/crvusd/${network}/psr/`),
})

const crvusdNetworkScrvUSDRoute = createRoute({
  getParentRoute: () => crvusdLayoutRoute,
  path: '$network/scrvUSD',
  component: lazy(() => import('../app/crvusd/[network]/scrvUSD/page')),
  head: () => ({
    meta: [{ title: 'Savings crvUSD - Curve' }],
  }),
})

const crvusdBetaMarketsRedirectRoute = createRoute({
  getParentRoute: () => crvusdLayoutRoute,
  path: '$network/beta-markets',
  loader: ({ params: { network } }) => redirectTo(`/llamalend/${network}/markets/`),
})

const crvusdNetworkRedirectRoute = createRoute({
  getParentRoute: () => crvusdLayoutRoute,
  path: '$network',
  loader: ({ params: { network } }) => redirectTo(`/crvusd/${network}/markets/`),
})

export const crvusdRoutes = crvusdLayoutRoute.addChildren([
  crvusdRoute,
  crvusdNetworkRedirectRoute,
  crvusdBetaMarketsRedirectRoute,
  crvusdNetworkDisclaimerRoute,
  crvusdNetworkIntegrationsRoute,
  crvusdNetworkMarketsRoute,
  crvusdNetworkMarketCreateRoute,
  crvusdNetworkMarketCreateNoFormTypeRoute,
  crvusdNetworkMarketManageRoute,
  crvusdNetworkMarketManageNoFormTypeRoute,
  crvusdNetworkPsrRoute,
  crvusdNetworkPegkeepersRedirectRoute,
  crvusdNetworkScrvUSDRoute,
])
