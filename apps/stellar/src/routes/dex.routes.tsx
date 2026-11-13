import { CreatePoolPage } from '@/stellar/features/create-pool/CreatePoolPage'
import { PoolPage } from '@/stellar/features/pool/PoolPage'
import { PoolListPage } from '@/stellar/features/pool-list/PoolListPage'
import type { NetworkQuery } from '@/stellar/queries/query-types'
import { createRoute, Outlet } from '@tanstack/react-router'
import { redirectTo } from '@ui/hooks/router'
import { rootRoute } from './root.routes'

const dexLayoutRoute = createRoute({ getParentRoute: () => rootRoute, path: 'dex', component: Outlet })

const layoutProps = { getParentRoute: () => dexLayoutRoute }

const title = (pageTitle: string) => `${pageTitle} - Curve Stellar`

export const dexRoutes = dexLayoutRoute.addChildren([
  createRoute({
    path: '$network/create-pool',
    component: CreatePoolPage,
    remountDeps: ({ params }: { params: NetworkQuery }) => params.network, // Network changes reuse this route
    head: () => ({ meta: [{ title: title('Create pool') }] }),
    ...layoutProps,
  }),
  createRoute({ path: '/', loader: () => redirectTo('/dex/stellar/pools/'), ...layoutProps }),
  createRoute({
    path: '$network',
    loader: ({ params: { network } }) => redirectTo(`/dex/${network}/pools/`),
    ...layoutProps,
  }),
  createRoute({
    path: '$network/pools',
    component: PoolListPage,
    head: () => ({ meta: [{ title: title('Pools') }] }),
    ...layoutProps,
  }),
  createRoute({
    path: '$network/pools/$pool',
    component: PoolPage,
    head: () => ({ meta: [{ title: title('Pool') }] }),
    ...layoutProps,
  }),
])
