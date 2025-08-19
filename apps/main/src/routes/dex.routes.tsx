import DexLayout from '@/app/dex/layout'
import { redirectTo } from '@/routes/util'
import { createRoute, Outlet } from '@tanstack/react-router'
import { rootRoute } from './root.routes'

export const dexLayoutRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: 'dex',
  component: () => (
    <DexLayout>
      <Outlet />
    </DexLayout>
  ),
})

const layoutProps = { getParentRoute: () => dexLayoutRoute }

export const dexRoutes = dexLayoutRoute.addChildren([
  createRoute({
    path: '/',
    component: () => import('../app/dex/page'),
    head: () => ({
      meta: [{ title: 'DEX - Curve' }],
    }),
    ...layoutProps,
  }),
  createRoute({
    path: '$network',
    loader: ({ params: { network } }) => redirectTo(`/dex/${network}/pools/`),
    ...layoutProps,
  }),
  createRoute({
    path: '/integrations',
    loader: () => redirectTo('/dex/ethereum/integrations/'),
    ...layoutProps,
  }),
  createRoute({
    path: '$network/compensation',
    component: () => import('../app/dex/[network]/compensation/page'),
    head: () => ({
      meta: [{ title: 'Compensation - Curve' }],
    }),
    ...layoutProps,
  }),
  createRoute({
    path: '$network/create-pool',
    component: () => import('../app/dex/[network]/create-pool/page'),
    head: () => ({
      meta: [{ title: 'Create Pool - Curve' }],
    }),
    ...layoutProps,
  }),
  createRoute({
    path: '$network/dashboard',
    component: () => import('../app/dex/[network]/dashboard/page'),
    head: () => ({
      meta: [{ title: 'Dashboard - Curve' }],
    }),
    ...layoutProps,
  }),
  createRoute({
    path: '$network/deploy-gauge',
    component: () => import('../app/dex/[network]/deploy-gauge/page'),
    head: () => ({
      meta: [{ title: 'Deploy Gauge - Curve' }],
    }),
    ...layoutProps,
  }),
  createRoute({
    path: '$network/disclaimer',
    component: () => import('../app/dex/[network]/disclaimer/page'),
    head: () => ({
      meta: [{ title: 'Risk Disclaimer - Curve' }],
    }),
    ...layoutProps,
  }),
  createRoute({
    path: '$network/integrations',
    component: () => import('../app/dex/[network]/integrations/page'),
    head: () => ({
      meta: [{ title: 'Integrations - Curve' }],
    }),
    ...layoutProps,
  }),
  createRoute({
    path: '$network/pools',
    component: () => import('../app/dex/[network]/pools/page'),
    head: () => ({
      meta: [{ title: 'Pools - Curve' }],
    }),
    ...layoutProps,
  }),
  createRoute({
    path: '$network/pools/$pool/$formType',
    component: () => import('../app/dex/[network]/pools/[pool]/[[...formType]]/page'),
    head: ({ params }) => ({
      meta: [{ title: `Curve - Pool - ${params.pool} - Curve` }],
    }),
    ...layoutProps,
  }),
  createRoute({
    path: '$network/pools/$pool',
    component: () => import('../app/dex/[network]/pools/[pool]/[[...formType]]/page'),
    head: ({ params }) => ({
      meta: [{ title: `Curve - Pool - ${params.pool} - Curve` }],
    }),
    ...layoutProps,
  }),
  createRoute({
    path: '$network/swap',
    component: () => import('../app/dex/[network]/swap/page'),
    head: () => ({
      meta: [{ title: 'Swap - Curve' }],
    }),
    ...layoutProps,
  }),
])
