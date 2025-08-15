import { lazy } from 'react'
import { createRoute, Outlet } from '@tanstack/react-router'
import { rootRoute } from './root.routes'
import { redirectTo } from './util'

const llamalendLayoutRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: 'llamalend',
  component: () => <Outlet />,
})

const llamalendNetworkRedirectRoute = createRoute({
  getParentRoute: () => llamalendLayoutRoute,
  path: '$network',
  loader: ({ params: { network } }) => redirectTo(`/llamalend/${network}/markets/`),
})

// LlamaLend routes
const llamalendNetworkDisclaimerRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/llamalend/$network/disclaimer',
  component: lazy(() => import('../app/llamalend/[network]/disclaimer/page')),
  head: () => ({
    meta: [{ title: 'Risk Disclaimer - Curve Llamalend' }],
  }),
})

const llamalendNetworkIntegrationsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/llamalend/$network/integrations',
  component: lazy(() => import('../app/llamalend/[network]/integrations/page')),
  head: () => ({
    meta: [{ title: 'Integrations - Curve Llamalend' }],
  }),
})

const llamalendNetworkMarketsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/llamalend/$network/markets',
  component: lazy(() => import('../app/llamalend/[network]/markets/page')),
  head: () => ({
    meta: [{ title: 'Llamalend Beta Markets - Curve' }],
  }),
})

export const llamalendRoutes = llamalendLayoutRoute.addChildren([
  llamalendNetworkRedirectRoute,
  llamalendNetworkDisclaimerRoute,
  llamalendNetworkIntegrationsRoute,
  llamalendNetworkMarketsRoute,
])
