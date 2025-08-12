import { lazy } from 'react'
import { rootRoute } from '@/routes/root'
import { redirectTo } from '@/routes/util'
import { createRoute, createRouter } from '@tanstack/react-router'
import { crvusdRoutes } from './crvusd'
import { daoRoutes } from './dao'
import { dexRoutes } from './dex'
import { lendRoutes } from './lend'
import { llamalendRoutes } from './llamalend'

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
