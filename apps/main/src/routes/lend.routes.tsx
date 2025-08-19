'use client'
import '@/global-extensions'
import PageIntegrations from '@/lend/components/PageIntegrations/Page'
import PageLoanCreate from '@/lend/components/PageLoanCreate/Page'
import PageLoanManage from '@/lend/components/PageLoanManage/Page'
import PageMarkets from '@/lend/components/PageMarketList/Page'
import PageVault from '@/lend/components/PageVault/Page'
import networks, { networksIdMapper } from '@/lend/networks'
import useStore from '@/lend/store/useStore'
import type { UrlParams } from '@/lend/types/lend.types'
import Skeleton from '@mui/material/Skeleton'
import { createRoute, Outlet } from '@tanstack/react-router'
import { useParams } from '@ui-kit/hooks/router'
import { useHydration } from '@ui-kit/hooks/useHydration'
import { useRedirectToEth } from '@ui-kit/hooks/useRedirectToEth'
import { useGasInfoAndUpdateLib } from '@ui-kit/lib/model/entities/gas-info'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import { Disclaimer } from '@ui-kit/widgets/Disclaimer'
import { rootRoute } from './root.routes'
import { redirectTo } from './util'

const { MinHeight } = SizesAndSpaces

function LendLayout() {
  const { network: networkId = 'ethereum' } = useParams<Partial<UrlParams>>()
  const chainId = networksIdMapper[networkId]
  const hydrate = useStore((s) => s.hydrate)
  const isHydrated = useHydration('llamaApi', hydrate, chainId)

  useRedirectToEth(networks[chainId], networkId, isHydrated)
  useGasInfoAndUpdateLib({ chainId, networks })

  return isHydrated && <Outlet />
}

export const lendLayoutRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: 'lend',
  component: LendLayout,
})

const layoutProps = { getParentRoute: () => lendLayoutRoute }

export const lendRoutes = lendLayoutRoute.addChildren([
  createRoute({
    path: '/',
    component: () => <Skeleton width="100%" height={MinHeight.pageContent} />,
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
    component: () => <Disclaimer currentApp="lend" />,
    head: () => ({
      meta: [{ title: 'Risk Disclaimer - Curve Lend' }],
    }),
    ...layoutProps,
  }),
  createRoute({
    path: '$network/integrations',
    component: PageIntegrations,
    head: () => ({
      meta: [{ title: 'Integrations - Curve Lend' }],
    }),
    ...layoutProps,
  }),
  createRoute({
    path: '$network/markets',
    component: PageMarkets,
    head: () => ({
      meta: [{ title: 'Markets - Curve Lend' }],
    }),
    ...layoutProps,
  }),
  createRoute({
    path: '$network/markets/$market/create/$formType',
    component: PageLoanCreate,
    head: ({ params }) => ({
      meta: [{ title: `${params.market} | Create Loan - Curve Lend` }],
    }),
    ...layoutProps,
  }),
  createRoute({
    path: '$network/markets/$market/create',
    component: PageLoanCreate,
    head: ({ params }) => ({
      meta: [{ title: `${params.market} | Create Loan - Curve Lend` }],
    }),
    ...layoutProps,
  }),
  createRoute({
    path: '$network/markets/$market/manage/$formType',
    component: PageLoanManage,
    head: ({ params }) => ({
      meta: [{ title: `${params.market} | Manage Loan - Curve Lend` }],
    }),
    ...layoutProps,
  }),
  createRoute({
    path: '$network/markets/$market/manage',
    component: PageLoanManage,
    head: ({ params }) => ({
      meta: [{ title: `${params.market} | Manage Loan - Curve Lend` }],
    }),
    ...layoutProps,
  }),
  createRoute({
    path: '$network/markets/$market/vault/$formType',
    component: PageVault,
    head: ({ params }) => ({
      meta: [{ title: `${params.market} | Supply - Curve Lend` }],
    }),
    ...layoutProps,
  }),
  createRoute({
    path: '$network/markets/$market/vault',
    component: PageVault,
    head: ({ params }) => ({
      meta: [{ title: `${params.market} | Supply - Curve Lend` }],
    }),
    ...layoutProps,
  }),
])
