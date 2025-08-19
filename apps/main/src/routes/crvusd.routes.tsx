import CrvUsdLayout from '@/app/crvusd/layout'
import { createRoute, Outlet } from '@tanstack/react-router'
import { rootRoute } from './root.routes'
import { redirectTo } from './util'

const crvusdLayoutRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: 'crvusd',
  component: () => (
    <CrvUsdLayout>
      <Outlet />
    </CrvUsdLayout>
  ),
})

const layoutProps = { getParentRoute: () => crvusdLayoutRoute }

export const crvusdRoutes = crvusdLayoutRoute.addChildren([
  createRoute({
    path: '/',
    component: () => import('../app/crvusd/page'),
    head: () => ({
      meta: [{ title: 'crvUSD - Curve' }],
    }),
    ...layoutProps,
  }),
  createRoute({
    path: '$network',
    loader: ({ params: { network } }) => redirectTo(`/crvusd/${network}/markets/`),
    ...layoutProps,
  }),
  createRoute({
    path: '$network/beta-markets',
    loader: ({ params: { network } }) => redirectTo(`/llamalend/${network}/markets/`),
    ...layoutProps,
  }),
  createRoute({
    path: '$network/disclaimer',
    component: () => import('../app/crvusd/[network]/disclaimer/page'),
    head: () => ({
      meta: [{ title: 'Risk Disclaimer - Curve' }],
    }),
    ...layoutProps,
  }),
  createRoute({
    path: '$network/integrations',
    component: () => import('../app/crvusd/[network]/integrations/page'),
    head: () => ({
      meta: [{ title: 'Integrations - Curve' }],
    }),
    ...layoutProps,
  }),
  createRoute({
    path: '$network/markets',
    component: () => import('../app/crvusd/[network]/markets/page'),
    head: () => ({
      meta: [{ title: 'Markets - Curve' }],
    }),
    ...layoutProps,
  }),
  createRoute({
    path: '$network/markets/$collateralId/create/$formType',
    component: () => import('../app/crvusd/[network]/markets/[collateralId]/create/[[...formType]]/page'),
    head: ({ params }) => ({
      meta: [{ title: `Create - ${params.collateralId} - Curve` }],
    }),
    ...layoutProps,
  }),
  createRoute({
    path: '$network/markets/$collateralId/create',
    component: () => import('../app/crvusd/[network]/markets/[collateralId]/create/[[...formType]]/page'),
    head: ({ params }) => ({
      meta: [{ title: `Create - ${params.collateralId} - Curve` }],
    }),
    ...layoutProps,
  }),
  createRoute({
    path: '$network/markets/$collateralId/manage/$formType',
    component: () => import('../app/crvusd/[network]/markets/[collateralId]/manage/[[...formType]]/page'),
    head: ({ params }) => ({
      meta: [{ title: `Manage - ${params.collateralId} - Curve` }],
    }),
    ...layoutProps,
  }),
  createRoute({
    path: '$network/markets/$collateralId/manage',
    component: () => import('../app/crvusd/[network]/markets/[collateralId]/manage/[[...formType]]/page'),
    head: ({ params }) => ({
      meta: [{ title: `Manage - ${params.collateralId} - Curve` }],
    }),
    ...layoutProps,
  }),
  createRoute({
    path: '$network/psr',
    component: () => import('../app/crvusd/[network]/psr/page'),
    head: () => ({
      meta: [{ title: 'Peg Stability Reserves - Curve' }],
    }),
    ...layoutProps,
  }),
  createRoute({
    path: '$network/pegkeepers',
    loader: ({ params: { network } }) => redirectTo(`/crvusd/${network}/psr/`),
    ...layoutProps,
  }),
  createRoute({
    path: '$network/scrvUSD',
    component: () => import('../app/crvusd/[network]/scrvUSD/page'),
    head: () => ({
      meta: [{ title: 'Savings crvUSD - Curve' }],
    }),
    ...layoutProps,
  }),
])
