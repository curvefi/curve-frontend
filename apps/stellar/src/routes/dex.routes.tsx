import { WorkInProgress } from '@/components/WorkInProgress'
import { PoolPage } from '@/features/deposit/PoolPage'
import { createRoute, Outlet } from '@tanstack/react-router'
import { redirectTo } from '@ui/hooks/router'
import { rootRoute } from './root.routes'

const dexLayoutRoute = createRoute({ getParentRoute: () => rootRoute, path: 'dex', component: Outlet })

const layoutProps = { getParentRoute: () => dexLayoutRoute }

export const dexRoutes = dexLayoutRoute.addChildren([
  createRoute({ path: '/', loader: () => redirectTo('/dex/stellar/pools/'), ...layoutProps }),
  createRoute({
    path: '$network',
    loader: ({ params: { network } }) => redirectTo(`/dex/${network}/pools/`),
    ...layoutProps,
  }),
  createRoute({
    path: '$network/pools',
    component: WorkInProgress,
    head: () => ({ meta: [{ title: 'Pools - Curve Stellar' }] }),
    ...layoutProps,
  }),
  createRoute({
    path: '$network/pools/$pool',
    component: PoolPage,
    head: () => ({ meta: [{ title: 'Pool - Curve Stellar' }] }),
    ...layoutProps,
  }),
])
