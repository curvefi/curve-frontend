import type { PoolAddressParams, PoolUrlParams } from '@/dex/types/main.types'
import { createRoute, lazyRouteComponent, redirect } from '@tanstack/react-router'
import { ETHEREUM_ONLY_NETWORK_SWITCH } from '@ui/features/layout/switch-chain/util'
import { redirectTo } from '@ui/hooks/router'
import { EXTERNAL_LINKS } from '@ui/lib/resource.constants'
import { rootRoute } from './root.routes'
import { createSharedRoutes } from './shared.routes'

const DexLayout = lazyRouteComponent(() => import('@/dex/DexLayout'), 'DexLayout')
const PageCompensation = lazyRouteComponent(() => import('@/dex/components/PageCompensation/Page'), 'PageCompensation')
const PageCreatePool = lazyRouteComponent(() => import('@/dex/components/PageCreatePool/Page'), 'PageCreatePool')
const PageDeployGauge = lazyRouteComponent(() => import('@/dex/components/PageDeployGauge/Page'), 'PageDeployGauge')
const PagePoolList = lazyRouteComponent(() => import('@/dex/features/pool-list/PoolListPage'), 'PoolListPage')
const PagePool = lazyRouteComponent(() => import('@/dex/components/PagePool/Page'), 'PagePool')
const PageManagePool = lazyRouteComponent(() => import('@/dex/components/PageManagePool'), 'ManagePool')
const PageRouterSwap = lazyRouteComponent(() => import('@/dex/components/PageRouterSwap/Page'), 'PageRouterSwap')

const dexLayoutRoute = createRoute({ getParentRoute: () => rootRoute, path: 'dex', component: DexLayout })

const layoutProps = { getParentRoute: () => dexLayoutRoute }

// Temporary fallback until these legacy pools are supported in the current UI.
const LEGACY_POOLS: Record<string, string> = {
  '0x80466c64868e1ab14a1ddf27a676c3fcbe638fe5': 'tricrypto',
  '0xe7a24ef0c5e95ffb0f6684b813a78f2a3ad7d171': 'linkusd',
  // We're phasing out pool ids but whatever, can't hurt I guess.
  tricrypto: 'tricrypto',
  linkusd: 'linkusd',
}

export const dexRoutes = dexLayoutRoute.addChildren([
  ...createSharedRoutes('dex', layoutProps),
  createRoute({
    path: '$network',
    loader: ({ params: { network } }) => redirectTo(`/dex/${network}/swap/`),
    ...layoutProps,
  }),
  createRoute({
    path: '$network/compensation',
    staticData: { networkSwitch: ETHEREUM_ONLY_NETWORK_SWITCH },
    loader: ({ params: { network } }) => {
      if (network !== 'ethereum') redirectTo('/dex/ethereum/compensation')
    },
    component: PageCompensation,
    head: () => ({ meta: [{ title: 'Compensation - Curve' }] }),
    ...layoutProps,
  }),
  createRoute({
    path: '$network/create-pool',
    component: PageCreatePool,
    head: () => ({ meta: [{ title: 'Create Pool - Curve' }] }),
    ...layoutProps,
  }),
  createRoute({
    path: '$network/deploy-gauge',
    component: PageDeployGauge,
    head: () => ({ meta: [{ title: 'Deploy Gauge - Curve' }] }),
    ...layoutProps,
  }),
  createRoute({
    path: '$network/pools',
    staticData: { networkSwitch: { type: 'same-page', clearSearchParams: ['page'] } },
    component: PagePoolList,
    head: () => ({ meta: [{ title: 'Pools - Curve' }] }),
    ...layoutProps,
  }),
  createRoute({
    path: '$network/pools/$poolIdOrAddress',
    staticData: { networkSwitch: { type: 'locked' } },
    loader: ({ params: { network, poolIdOrAddress } }: { params: PoolUrlParams }) => {
      if (network !== 'ethereum') return
      const legacyPoolId = LEGACY_POOLS[poolIdOrAddress.toLowerCase()]
      if (legacyPoolId)
        redirect({ href: `${EXTERNAL_LINKS.curve.classic}${legacyPoolId}/withdraw`, replace: true, throw: true })
    },
    component: PagePool,
    head: ({ params: { poolIdOrAddress } }: { params: PoolUrlParams }) => ({
      meta: [{ title: `Curve - Pool - ${poolIdOrAddress} - Curve` }],
    }),
    ...layoutProps,
  }),
  createRoute({
    path: '$network/pools/$poolAddress/manage-pool',
    staticData: { networkSwitch: { type: 'locked' } },
    component: PageManagePool,
    head: ({ params: { poolAddress } }: { params: PoolAddressParams }) => ({
      meta: [{ title: `Curve - Pool - ${poolAddress} - Manage` }],
    }),
    ...layoutProps,
  }),
  createRoute({
    path: '$network/pools/$poolIdOrAddress/$formType',
    loader: ({ params: { network, poolIdOrAddress } }) => redirectTo(`/dex/${network}/pools/${poolIdOrAddress}`),
    ...layoutProps,
  }),
  createRoute({
    path: '$network/swap',
    staticData: { networkSwitch: { type: 'same-page', clearSearchParams: ['from', 'to'] } },
    component: PageRouterSwap,
    head: () => ({ meta: [{ title: 'Swap - Curve' }] }),
    ...layoutProps,
  }),
])
