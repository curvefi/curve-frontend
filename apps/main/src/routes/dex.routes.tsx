import type { PoolAddressParams } from '@/dex/types/main.types'
import { createRoute, lazyRouteComponent, redirect } from '@tanstack/react-router'
import {
  ETHEREUM_ONLY_NETWORK_SWITCH,
  NETWORK_SWITCH_UNAVAILABLE,
} from '@ui/features/layout/switch-chain/switch-policies'
import { redirectTo } from '@ui/hooks/router'
import { t } from '@ui/lib/i18n'
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

const toastTitle = (networkName?: string) =>
  networkName ? t`This pool is only available on ${networkName}` : NETWORK_SWITCH_UNAVAILABLE

// Temporary fallback until these legacy pools are supported in the current UI.
export const LEGACY_POOLS: Record<string, string> = {
  '0x80466c64868e1ab14a1ddf27a676c3fcbe638fe5': 'tricrypto',
  '0xe7a24ef0c5e95ffb0f6684b813a78f2a3ad7d171': 'linkusd',
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
    path: '$network/pools/$poolAddress',
    staticData: { networkSwitch: { type: 'locked', toastTitle } },
    loader: ({ params: { network, poolAddress } }: { params: PoolAddressParams }) => {
      if (network !== 'ethereum') return
      const legacyPoolId = LEGACY_POOLS[poolAddress.toLowerCase()]
      if (legacyPoolId)
        redirect({ href: `${EXTERNAL_LINKS.curve.classic}${legacyPoolId}/withdraw`, replace: true, throw: true })
    },
    component: PagePool,
    head: ({ params: { poolAddress } }: { params: PoolAddressParams }) => ({
      meta: [{ title: `Curve - Pool - ${poolAddress} - Curve` }],
    }),
    ...layoutProps,
  }),
  createRoute({
    path: '$network/pools/$poolAddress/manage-pool',
    staticData: { networkSwitch: { type: 'locked', toastTitle } },
    component: PageManagePool,
    head: ({ params: { poolAddress } }: { params: PoolAddressParams }) => ({
      meta: [{ title: `Curve - Pool - ${poolAddress} - Manage` }],
    }),
    ...layoutProps,
  }),
  createRoute({
    path: '$network/pools/$poolAddress/$formType',
    loader: ({ params: { network, poolAddress } }) => redirectTo(`/dex/${network}/pools/${poolAddress}`),
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
