import '@/global-extensions'
import { createRoute, createRouter } from '@tanstack/react-router'
import { t } from '@ui-kit/lib/i18n'
import { ErrorPage } from '@ui-kit/pages/ErrorPage'
import { Duration } from '@ui-kit/themes/design/0_primitives'
import { analyticsRoutes } from './analytics.routes'
import { bridgeRoutes } from './bridge.routes'
import { crvusdRoutes } from './crvusd.routes'
import { daoRoutes } from './dao.routes'
import { dexRoutes } from './dex.routes'
import { lendRoutes } from './lend.routes'
import { llamalendRoutes } from './llamalend.routes'
import { Loading } from './Loading'
import { rootRoute } from './root.routes'
import { redirectTo } from './util'

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: Loading, // Redirect is handled by the `useOnChainUnavailable` hook
  head: () => ({ meta: [{ title: 'Curve.finance' }] }),
})

const integrationsRedirectRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/integrations',
  loader: () => redirectTo('/dex/ethereum/integrations/'),
})

export const router = createRouter({
  scrollRestoration: true,
  defaultPendingComponent: Loading,
  defaultPendingMs: Duration.Transition,
  routeTree: rootRoute.addChildren([
    indexRoute,
    analyticsRoutes,
    crvusdRoutes,
    daoRoutes,
    dexRoutes,
    lendRoutes,
    llamalendRoutes,
    bridgeRoutes,
    integrationsRedirectRoute,
  ]),
  defaultPreload: 'intent',
  defaultPreloadStaleTime: 0,
  defaultErrorComponent: ({ error }) => (
    <>
      <head>
        <title>{t`Error` + ' - Curve'}</title>
      </head>
      <ErrorPage
        title={t`Unexpected Error`}
        subtitle={error.message || t`An unexpected error occurred`}
        error={error}
      />
    </>
  ),
  defaultNotFoundComponent: () => (
    <>
      <head>
        <title>{t`Error 404` + ' - Curve'}</title>
      </head>
      <ErrorPage title="404" subtitle={t`Page Not Found`} continueUrl="/" />
    </>
  ),
})

// Register router for type safety
declare module '@tanstack/react-router' {
  // eslint-disable-next-line @typescript-eslint/consistent-type-definitions
  interface Register {
    router: typeof router
  }
}
