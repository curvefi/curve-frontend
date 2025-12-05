import '@/analytics/llamadash'
import { PageHome } from '@/analytics/components/PageHome'
import { createRoute } from '@tanstack/react-router'
import { rootRoute } from './root.routes'
import { createSharedRoutes } from './shared.routes'
import { redirectTo } from './util'

const analyticsLayoutRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: 'analytics',
})

const layoutProps = { getParentRoute: () => analyticsLayoutRoute }

export const analyticsRoutes = analyticsLayoutRoute.addChildren([
  ...createSharedRoutes('analytics', layoutProps),
  createRoute({
    path: '$network',
    loader: ({ params: { network } }) => redirectTo(`/analytics/${network}/home`),
    ...layoutProps,
  }),
  createRoute({
    path: '$network/home',
    component: PageHome,
    ...layoutProps,
  }),
])
