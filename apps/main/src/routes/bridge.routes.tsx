import { PageBridge } from '@/bridge'
import { createRoute } from '@tanstack/react-router'
import { rootRoute } from './root.routes'
import { createSharedRoutes } from './shared.routes'

const bridgeLayoutRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: 'bridge',
})

const layoutProps = { getParentRoute: () => bridgeLayoutRoute }

export const bridgeRoutes = bridgeLayoutRoute.addChildren([
  ...createSharedRoutes('bridge', layoutProps),
  createRoute({
    path: '$network',
    component: PageBridge,
    ...layoutProps,
  }),
])
