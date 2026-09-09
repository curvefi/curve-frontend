import { StellarErrorPage } from '@stellar/components/StellarErrorPage'
import { createRoute, createRouter } from '@tanstack/react-router'
import { Loading } from '@ui/components/Loading'
import { Duration } from '@ui/features/themes/design/0_primitives'
import { t } from '@ui/lib/i18n'
import { rootRoute } from './root.routes'

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: () => <Loading title="Curve Stellar" subtitle={t`Work in progress`} />,
  head: () => ({ meta: [{ title: 'Curve Stellar' }] }),
})

export const router = createRouter({
  scrollRestoration: true,
  defaultPendingComponent: Loading,
  defaultPendingMs: Duration.Transition,
  routeTree: rootRoute.addChildren([indexRoute]),
  defaultPreload: 'intent',
  defaultPreloadStaleTime: 0,
  defaultErrorComponent: ({ error }) => (
    <>
      <head>
        <title>{t`Error` + ' - Curve'}</title>
      </head>
      <StellarErrorPage
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
      <StellarErrorPage title="404" subtitle={t`Page Not Found`} continueUrl="/" />
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
