import '@/global-extensions'
import { PageAnalytics } from '@/dao/components/PageAnalytics/Page'
import { PageGauge } from '@/dao/components/PageGauge/Page'
import { PageGauges } from '@/dao/components/PageGauges/Page'
import { PageProposal } from '@/dao/components/PageProposal/Page'
import { PageDao } from '@/dao/components/PageProposals/Page'
import { PageUser } from '@/dao/components/PageUser/Page'
import { PageVeCrv } from '@/dao/components/PageVeCrv/Page'
import networks, { networksIdMapper } from '@/dao/networks'
import useStore from '@/dao/store/useStore'
import { type UrlParams } from '@/dao/types/dao.types'
import Skeleton from '@mui/material/Skeleton'
import { createRoute, Outlet } from '@tanstack/react-router'
import { useLayoutStore } from '@ui-kit/features/layout'
import { useParams } from '@ui-kit/hooks/router'
import { useHydration } from '@ui-kit/hooks/useHydration'
import usePageVisibleInterval from '@ui-kit/hooks/usePageVisibleInterval'
import { useRedirectToEth } from '@ui-kit/hooks/useRedirectToEth'
import { REFRESH_INTERVAL } from '@ui-kit/lib/model'
import { useGasInfoAndUpdateLib } from '@ui-kit/lib/model/entities/gas-info'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import { Disclaimer } from '@ui-kit/widgets/Disclaimer/Disclaimer'
import { rootRoute } from './root.routes'
import { redirectTo } from './util'

const { MinHeight } = SizesAndSpaces

const useAutoRefresh = (isHydrated: boolean) => {
  const isPageVisible = useLayoutStore((state) => state.isPageVisible)
  const getGauges = useStore((state) => state.gauges.getGauges)
  const getGaugesData = useStore((state) => state.gauges.getGaugesData)
  usePageVisibleInterval(
    () => Promise.all([getGauges(), getGaugesData()]),
    REFRESH_INTERVAL['5m'],
    isPageVisible && isHydrated,
  )
}

function DaoLayout() {
  const { network = 'ethereum' } = useParams<Partial<UrlParams>>()
  const hydrate = useStore((s) => s.hydrate)
  const chainId = networksIdMapper[network]
  const isHydrated = useHydration('curveApi', hydrate, chainId)

  useRedirectToEth(networks[chainId], network, isHydrated)
  useGasInfoAndUpdateLib({ chainId, networks })
  useAutoRefresh(isHydrated)

  return <Outlet />
}

const daoLayoutRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: 'dao',
  component: DaoLayout,
})

const layoutProps = { getParentRoute: () => daoLayoutRoute }

export const daoRoutes = daoLayoutRoute.addChildren([
  createRoute({
    path: '/',
    /** Redirect is handled by the `RootLayout` component */
    component: () => <Skeleton width="100%" height={MinHeight.pageContent} />,
    head: () => ({
      meta: [{ title: 'DAO - Curve' }],
    }),
    ...layoutProps,
  }),
  createRoute({
    path: '$network',
    loader: ({ params: { network } }) => redirectTo(`/dao/${network}/proposals/`),
    ...layoutProps,
  }),
  createRoute({
    path: '$network/integrations',
    loader: ({ params: { network } }) => redirectTo(`/dex/${network}/integrations/`),
    ...layoutProps,
  }),
  createRoute({
    path: '$network/analytics',
    component: PageAnalytics,
    head: () => ({
      meta: [{ title: 'Analytics - Curve' }],
    }),
    ...layoutProps,
  }),
  createRoute({
    path: '$network/disclaimer',
    component: () => <Disclaimer currentApp="dao" />,
    head: () => ({
      meta: [{ title: 'Risk Disclaimer - Curve' }],
    }),
    ...layoutProps,
  }),
  createRoute({
    path: '$network/gauges',
    component: PageGauges,
    head: () => ({
      meta: [{ title: 'Gauges - Curve' }],
    }),
    ...layoutProps,
  }),
  createRoute({
    path: '$network/gauges/$gaugeAddress',
    component: PageGauge,
    head: ({ params }) => ({
      meta: [{ title: `Gauge - ${params.gaugeAddress} - Curve` }],
    }),
    ...layoutProps,
  }),
  createRoute({
    path: '$network/proposals',
    component: PageDao,
    head: () => ({
      meta: [{ title: 'Proposals - Curve' }],
    }),
    ...layoutProps,
  }),
  createRoute({
    path: '$network/proposals/$proposalId',
    component: PageProposal,
    head: ({ params }) => ({
      meta: [{ title: `Proposal - ${params.proposalId} - Curve` }],
    }),
    ...layoutProps,
  }),
  createRoute({
    path: '$network/user/$userAddress',
    component: PageUser,
    head: ({ params }) => ({
      meta: [{ title: `veCRV Holder - ${params.userAddress} - Curve` }],
    }),
    ...layoutProps,
  }),
  createRoute({
    path: '$network/vecrv/$formType',
    component: PageVeCrv,
    head: () => ({
      meta: [{ title: 'CRV Locker - Curve' }],
    }),
    ...layoutProps,
  }),
  createRoute({
    path: '$network/vecrv',
    loader: ({ params: { network } }) => redirectTo(`/dao/${network}/vecrv/create/`),
    ...layoutProps,
  }),
])
