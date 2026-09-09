import '@/analytics/llamadash'
import { createRoute, lazyRouteComponent } from '@tanstack/react-router'
import { redirectTo } from '@ui/hooks/router'
import { rootRoute } from './root.routes'
import { createSharedRoutes } from './shared.routes'

const PageHome = lazyRouteComponent(() => import('@/analytics/components/PageHome'), 'PageHome')

const analyticsLayoutRoute = createRoute({ getParentRoute: () => rootRoute, path: 'analytics' })

const layoutProps = { getParentRoute: () => analyticsLayoutRoute }

export const analyticsRoutes = analyticsLayoutRoute.addChildren([
  ...createSharedRoutes('analytics', layoutProps),
  createRoute({
    path: '$network',
    loader: ({ params: { network } }) => redirectTo(`/analytics/${network}/home`),
    ...layoutProps,
  }),
  createRoute({ path: '$network/home', component: PageHome, ...layoutProps }),
])
