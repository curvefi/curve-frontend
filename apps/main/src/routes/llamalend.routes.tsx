import Integrations from '@/lend/components/PageIntegrations/Page'
import { LlamaMarketsPage } from '@/llamalend/PageLlamaMarkets/Page'
import { createRoute, Outlet } from '@tanstack/react-router'
import { Disclaimer } from '@ui-kit/widgets/Disclaimer'
import { rootRoute } from './root.routes'
import { redirectTo } from './util'

const llamalendLayoutRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: 'llamalend',
  component: () => <Outlet />,
})

const layoutProps = { getParentRoute: () => llamalendLayoutRoute }

export const llamalendRoutes = llamalendLayoutRoute.addChildren([
  createRoute({
    path: '$network',
    loader: ({ params: { network } }) => redirectTo(`/llamalend/${network}/markets/`),
    ...layoutProps,
  }),
  createRoute({
    path: '$network/disclaimer',
    component: () => <Disclaimer currentApp="llamalend" />,
    head: () => ({
      meta: [{ title: 'Risk Disclaimer - Curve Llamalend' }],
    }),
    ...layoutProps,
  }),
  createRoute({
    path: '$network/integrations',
    component: Integrations,
    head: () => ({
      meta: [{ title: 'Integrations - Curve Llamalend' }],
    }),
    ...layoutProps,
  }),
  createRoute({
    path: '$network/markets',
    component: LlamaMarketsPage,
    head: () => ({
      meta: [{ title: 'Llamalend Markets - Curve' }],
    }),
    ...layoutProps,
  }),
])
