import { LlamaMarketsList } from '@/llamalend/features/market-list/LlamaMarketsList'
import { createRoute } from '@tanstack/react-router'
import { rootRoute } from './root.routes'
import { createSharedRoutes } from './shared.routes'
import { redirectTo } from './util'

const llamalendLayoutRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: 'llamalend',
})

const layoutProps = { getParentRoute: () => llamalendLayoutRoute }

export const llamalendRoutes = llamalendLayoutRoute.addChildren([
  ...createSharedRoutes('llamalend', layoutProps),
  createRoute({
    path: '$network',
    loader: ({ params: { network } }) => redirectTo(`/llamalend/${network}/markets/`),
    ...layoutProps,
  }),
  createRoute({
    path: '$network/markets',
    component: LlamaMarketsList,
    head: () => ({
      meta: [{ title: 'Llamalend Markets - Curve' }],
    }),
    ...layoutProps,
  }),
])
