import { createRoute, createRouter } from '@tanstack/react-router'
import { rootRoute } from './root.routes'

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: () => (
    <main>
      <h1>Curve Stellar placeholder</h1>
    </main>
  ),
  head: () => ({ meta: [{ title: 'Curve Stellar' }] }),
})

export const router = createRouter({
  scrollRestoration: true,
  routeTree: rootRoute.addChildren([indexRoute]),
  defaultPreload: 'intent',
  defaultNotFoundComponent: () => (
    <main className="stellar-page">
      <h1>404</h1>
      <p>Page not found</p>
    </main>
  ),
  defaultErrorComponent: ({ error }) => (
    <main className="stellar-page">
      <h1>Unexpected error</h1>
      <p>{error.message}</p>
    </main>
  ),
})

declare module '@tanstack/react-router' {
  // eslint-disable-next-line @typescript-eslint/consistent-type-definitions
  interface Register {
    router: typeof router
  }
}
