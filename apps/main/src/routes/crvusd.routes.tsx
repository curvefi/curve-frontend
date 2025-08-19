'use client'
import '@/global-extensions'
import { type ReactNode } from 'react'
import CrvStaking from '@/loan/components/PageCrvUsdStaking/Page'
import Integrations from '@/loan/components/PageIntegrations/Page'
import CreateLoan from '@/loan/components/PageLoanCreate/Page'
import ManageLoan from '@/loan/components/PageLoanManage/Page'
import MarketList from '@/loan/components/PageMarketList/Page'
import { Page as PegKeepersPage } from '@/loan/components/PagePegKeepers'
import { networks, networksIdMapper } from '@/loan/networks'
import useStore from '@/loan/store/useStore'
import type { UrlParams } from '@/loan/types/loan.types'
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

// Inline CrvUsdClientLayout
function CrvUsdClientLayout({ children }: { children: ReactNode }) {
  const { network: networkId = 'ethereum' } = useParams<Partial<UrlParams>>()
  const chainId = networksIdMapper[networkId]
  const hydrate = useStore((s) => s.hydrate)
  const isHydrated = useHydration('llamaApi', hydrate, chainId)

  useGasInfoAndUpdateLib({ chainId, networks })
  useRedirectToEth(networks[chainId], networkId, isHydrated)

  return isHydrated && children
}

const crvusdLayoutRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: 'crvusd',
  component: () => (
    <CrvUsdClientLayout>
      <Outlet />
    </CrvUsdClientLayout>
  ),
})

const layoutProps = { getParentRoute: () => crvusdLayoutRoute }

export const crvusdRoutes = crvusdLayoutRoute.addChildren([
  createRoute({
    path: '/',
    component: () => <Skeleton width="100%" height={MinHeight.pageContent} />,
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
    component: () => <Disclaimer currentApp="crvusd" />,
    head: () => ({
      meta: [{ title: 'Risk Disclaimer - Curve' }],
    }),
    ...layoutProps,
  }),
  createRoute({
    path: '$network/integrations',
    component: Integrations,
    head: () => ({
      meta: [{ title: 'Integrations - Curve' }],
    }),
    ...layoutProps,
  }),
  createRoute({
    path: '$network/markets',
    component: MarketList,
    head: () => ({
      meta: [{ title: 'Markets - Curve' }],
    }),
    ...layoutProps,
  }),
  createRoute({
    path: '$network/markets/$collateralId/create/$formType',
    component: CreateLoan,
    head: ({ params }) => ({
      meta: [{ title: `Create - ${params.collateralId} - Curve` }],
    }),
    ...layoutProps,
  }),
  createRoute({
    path: '$network/markets/$collateralId/create',
    component: CreateLoan,
    head: ({ params }) => ({
      meta: [{ title: `Create - ${params.collateralId} - Curve` }],
    }),
    ...layoutProps,
  }),
  createRoute({
    path: '$network/markets/$collateralId/manage/$formType',
    component: ManageLoan,
    head: ({ params }) => ({
      meta: [{ title: `Manage - ${params.collateralId} - Curve` }],
    }),
    ...layoutProps,
  }),
  createRoute({
    path: '$network/markets/$collateralId/manage',
    component: ManageLoan,
    head: ({ params }) => ({
      meta: [{ title: `Manage - ${params.collateralId} - Curve` }],
    }),
    ...layoutProps,
  }),
  createRoute({
    path: '$network/psr',
    component: PegKeepersPage,
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
    component: CrvStaking,
    head: () => ({
      meta: [{ title: 'Savings crvUSD - Curve' }],
    }),
    ...layoutProps,
  }),
])
