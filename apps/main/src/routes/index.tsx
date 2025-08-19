import { rootRoute } from '@/routes/root.routes'
import { redirectTo } from '@/routes/util'
import Skeleton from '@mui/material/Skeleton'
import { createRoute, createRouter } from '@tanstack/react-router'
import { t } from '@ui-kit/lib/i18n'
import { PageNotFound } from '@ui-kit/pages/PageNotFound'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import { crvusdRoutes } from './crvusd.routes'
import { daoRoutes } from './dao.routes'
import { dexRoutes } from './dex.routes'
import { lendRoutes } from './lend.routes'
import { llamalendRoutes } from './llamalend.routes'

const { MinHeight } = SizesAndSpaces

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  /** Redirect is handled by the `RootLayout` component */
  component: () => <Skeleton width="100%" height={MinHeight.pageContent} />,
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
  defaultNotFoundComponent: () => (
    <>
      <head>
        <title>{t`Error 404` + ' - Curve'}</title>
      </head>
      <PageNotFound />
    </>
  ),
})

// Register router for type safety
declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}
