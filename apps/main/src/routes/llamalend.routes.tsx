import { createRoute, Outlet } from '@tanstack/react-router'
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
    component: () => import('../app/llamalend/[network]/disclaimer/page'),
    head: () => ({
      meta: [{ title: 'Risk Disclaimer - Curve Llamalend' }],
    }),
    ...layoutProps,
  }),
  createRoute({
    path: '$network/integrations',
    component: () => import('../app/llamalend/[network]/integrations/page'),
    head: () => ({
      meta: [{ title: 'Integrations - Curve Llamalend' }],
    }),
    ...layoutProps,
  }),
  createRoute({
    path: '$network/markets',
    component: () => import('../app/llamalend/[network]/markets/page'),
    head: () => ({
      meta: [{ title: 'Llamalend Beta Markets - Curve' }],
    }),
    ...layoutProps,
  }),
])
