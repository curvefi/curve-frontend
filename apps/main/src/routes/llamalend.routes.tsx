import { PageIntegrations } from '@/lend/components/PageIntegrations/Page'
import { LlamaMarketsList } from '@/llamalend/features/market-list/LlamaMarketsList'
import { createRoute, Outlet } from '@tanstack/react-router'
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
    loader: ({ params: { network } }) => redirectTo(`/llamalend/${network}/legal/?tab=disclaimers`),
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
    component: PageIntegrations,
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
