import { PageBridges } from '@/bridge/components/PageBridges'
import { createRoute } from '@tanstack/react-router'
import { rootRoute } from './root.routes'
import { createSharedRoutes } from './shared.routes'
import { redirectTo } from './util'

const bridgeLayoutRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: 'bridge',
})

const layoutProps = { getParentRoute: () => bridgeLayoutRoute }

export const bridgeRoutes = bridgeLayoutRoute.addChildren([
  ...createSharedRoutes('bridge', layoutProps),
  createRoute({
    path: '$network',
    loader: ({ params: { network } }) => redirectTo(`/bridge/${network}/bridges`),
    ...layoutProps,
  }),
  createRoute({
    path: '$network/bridges',
    component: PageBridges,
    ...layoutProps,
  }),
])
