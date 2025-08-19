import LendLayout from '@/app/lend/layout'
import { createRoute, Outlet } from '@tanstack/react-router'
import { rootRoute } from './root.routes'
import { redirectTo } from './util'

export const lendLayoutRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: 'lend',
  component: () => (
    <LendLayout>
      <Outlet />
    </LendLayout>
  ),
})

const layoutProps = { getParentRoute: () => lendLayoutRoute }

export const lendRoutes = lendLayoutRoute.addChildren([
  createRoute({
    path: '/',
    component: () => import('../app/lend/page'),
    head: () => ({
      meta: [{ title: 'Lend - Curve' }],
    }),
    ...layoutProps,
  }),
  createRoute({
    path: '$network',
    loader: ({ params: { network } }) => redirectTo(`/lend/${network}/markets/`),
    ...layoutProps,
  }),
  createRoute({
    path: '$network/disclaimer',
    component: () => import('../app/lend/[network]/disclaimer/page'),
    head: () => ({
      meta: [{ title: 'Risk Disclaimer - Curve Lend' }],
    }),
    ...layoutProps,
  }),
  createRoute({
    path: '$network/integrations',
    component: () => import('../app/lend/[network]/integrations/page'),
    head: () => ({
      meta: [{ title: 'Integrations - Curve Lend' }],
    }),
    ...layoutProps,
  }),
  createRoute({
    path: '$network/markets',
    component: () => import('../app/lend/[network]/markets/page'),
    head: () => ({
      meta: [{ title: 'Markets - Curve Lend' }],
    }),
    ...layoutProps,
  }),
  createRoute({
    path: '$network/markets/$market/create/$formType',
    component: () => import('../app/lend/[network]/markets/[market]/create/[[...formType]]/page'),
    head: ({ params }) => ({
      meta: [{ title: `${params.market} | Create Loan - Curve Lend` }],
    }),
    ...layoutProps,
  }),
  createRoute({
    path: '$network/markets/$market/create',
    component: () => import('../app/lend/[network]/markets/[market]/create/[[...formType]]/page'),
    head: ({ params }) => ({
      meta: [{ title: `${params.market} | Create Loan - Curve Lend` }],
    }),
    ...layoutProps,
  }),
  createRoute({
    path: '$network/markets/$market/manage/$formType',
    component: () => import('../app/lend/[network]/markets/[market]/manage/[[...formType]]/page'),
    head: ({ params }) => ({
      meta: [{ title: `${params.market} | Manage Loan - Curve Lend` }],
    }),
    ...layoutProps,
  }),
  createRoute({
    path: '$network/markets/$market/manage',
    component: () => import('../app/lend/[network]/markets/[market]/manage/[[...formType]]/page'),
    head: ({ params }) => ({
      meta: [{ title: `${params.market} | Manage Loan - Curve Lend` }],
    }),
    ...layoutProps,
  }),
  createRoute({
    path: '$network/markets/$market/vault/$formType',
    component: () => import('../app/lend/[network]/markets/[market]/vault/[[...formType]]/page'),
    head: ({ params }) => ({
      meta: [{ title: `${params.market} | Supply - Curve Lend` }],
    }),
    ...layoutProps,
  }),
  createRoute({
    path: '$network/markets/$market/vault',
    component: () => import('../app/lend/[network]/markets/[market]/vault/[[...formType]]/page'),
    head: ({ params }) => ({
      meta: [{ title: `${params.market} | Supply - Curve Lend` }],
    }),
    ...layoutProps,
  }),
])
