import { lazy } from 'react'
import { rootRoute } from '@/routes/root.routes'
import { redirectTo } from '@/routes/util'
import { createRoute, createRouter } from '@tanstack/react-router'
import { crvusdRoutes } from './crvusd.routes'
import { daoRoutes } from './dao.routes'
import { dexRoutes } from './dex.routes'
import { lendRoutes } from './lend.routes'
import { llamalendRoutes } from './llamalend.routes'

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: lazy(() => import('../app/page')),
  head: () => ({
    meta: [{ title: 'Curve.finance' }],
  }),
})

const integrationsRedirectRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/integrations',
  loader: () => redirectTo('/dex/ethereum/integrations/'),
})

export const router = createRouter({
  routeTree: rootRoute.addChildren([
    indexRoute,
    crvusdRoutes,
    daoRoutes,
    dexRoutes,
    lendRoutes,
    llamalendRoutes,
    integrationsRedirectRoute,
  ]),
  defaultPreload: 'intent',
  defaultPreloadStaleTime: 0,
  defaultNotFoundComponent: lazy(() => import('../app/not-found')),
})

// Register router for type safety
declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}
