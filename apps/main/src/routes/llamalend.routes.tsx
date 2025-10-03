import Integrations from '@/lend/components/PageIntegrations/Page'
import { LlamaMarketsList } from '@/llamalend/features/market-list/LlamaMarketsList'
import { createRoute, Outlet } from '@tanstack/react-router'
import { Disclaimer } from '@ui-kit/widgets/Disclaimer'
import { LegalPage } from '@ui-kit/widgets/Legal'
import { rootRoute } from './root.routes'
import { redirectTo } from './util'

const llamalendLayoutRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: 'llamalend',
  component: Outlet,
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
    path: '$network/legal',
    component: () => <LegalPage currentApp="llamalend" />,
    head: () => ({
      meta: [{ title: 'Legal - Curve Llamalend' }],
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
    component: LlamaMarketsList,
    head: () => ({
      meta: [{ title: 'Llamalend Markets - Curve' }],
    }),
    ...layoutProps,
  }),
])
