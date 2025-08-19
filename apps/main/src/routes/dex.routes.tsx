'use client'
import '@/global-extensions'
import { use, useCallback, useEffect, useState } from 'react'
import { PageCompensation } from '@/dex/components/PageCompensation/Page'
import { PageCreatePool } from '@/dex/components/PageCreatePool/Page'
import { PageDashboard } from '@/dex/components/PageDashboard/Page'
import { PageDeployGauge } from '@/dex/components/PageDeployGauge/Page'
import { PageIntegrations } from '@/dex/components/PageIntegrations/Page'
import { PagePool } from '@/dex/components/PagePool/Page'
import { PagePoolList } from '@/dex/components/PagePoolList/Page'
import { PageRouterSwap } from '@/dex/components/PageRouterSwap/Page'
import curvejsApi from '@/dex/lib/curvejs'
import { getNetworkDefs } from '@/dex/lib/networks'
import useStore from '@/dex/store/useStore'
import type { CurveApi, UrlParams } from '@/dex/types/main.types'
import { recordValues } from '@curvefi/prices-api/objects.util'
import Skeleton from '@mui/material/Skeleton'
import { createRoute, Outlet } from '@tanstack/react-router'
import type { NetworkDef } from '@ui/utils'
import { useConnection } from '@ui-kit/features/connect-wallet'
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

const useAutoRefresh = (networkDef: NetworkDef) => {
  const { curveApi } = useConnection()

  const isPageVisible = useLayoutStore((state) => state.isPageVisible)
  const fetchPools = useStore((state) => state.pools.fetchPools)
  const poolDataMapper = useStore((state) => state.pools.poolsMapper[networkDef.chainId])
  const fetchPoolsVolume = useStore((state) => state.pools.fetchPoolsVolume)
  const fetchPoolsTvl = useStore((state) => state.pools.fetchPoolsTvl)
  const setTokensMapper = useStore((state) => state.tokens.setTokensMapper)
  const fetchAllStoredBalances = useStore((state) => state.userBalances.fetchAllStoredBalances)
  const network = useStore((state) => state.networks.networks[networkDef.chainId])
  const networks = useStore((state) => state.networks.networks)

  useGasInfoAndUpdateLib({ chainId: networkDef.chainId, networks })

  const fetchPoolsVolumeTvl = useCallback(
    async (curve: CurveApi) => {
      const { chainId } = curve
      const poolsData = Object.values(poolDataMapper)
      await Promise.all([fetchPoolsVolume(chainId, poolsData), fetchPoolsTvl(curve, poolsData)])
      void setTokensMapper(chainId, poolsData)
    },
    [fetchPoolsTvl, fetchPoolsVolume, poolDataMapper, setTokensMapper],
  )

  const refetchPools = useCallback(async () => {
    if (!curveApi || !network) return console.warn('Curve API or network is not defined, cannot refetch pools')
    const poolIds = await curvejsApi.network.fetchAllPoolsList(curveApi, network)
    void fetchPools(curveApi, poolIds, null)
  }, [curveApi, fetchPools, network])

  usePageVisibleInterval(
    () => {
      if (curveApi) {
        void fetchPoolsVolumeTvl(curveApi)

        if (curveApi.signerAddress) {
          void fetchAllStoredBalances(curveApi)
        }
      }
    },
    REFRESH_INTERVAL['5m'],
    isPageVisible,
  )

  usePageVisibleInterval(refetchPools, REFRESH_INTERVAL['11m'], isPageVisible && !!curveApi && !!network)
}

function DexLayout() {
  const networks = use(getNetworkDefs())
  const { network: networkId = 'ethereum' } = useParams<Partial<UrlParams>>()
  const [appLoaded, setAppLoaded] = useState(false)
  const fetchNetworks = useStore((state) => state.networks.fetchNetworks)
  const hydrate = useStore((s) => s.hydrate)

  const network = recordValues(networks).find((n) => n.id === networkId)!
  const isHydrated = useHydration('curveApi', hydrate, network.chainId)
  useRedirectToEth(network, networkId, isHydrated)

  useEffect(() => {
    const abort = new AbortController()
    void (async () => {
      try {
        await fetchNetworks()
      } finally {
        if (!abort.signal.aborted) {
          setAppLoaded(true)
        }
      }
    })()
    return () => {
      setAppLoaded(false)
      abort.abort()
    }
  }, [fetchNetworks])

  useAutoRefresh(network)
  return appLoaded && isHydrated && <Outlet />
}

export const dexLayoutRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: 'dex',
  component: DexLayout,
})

const layoutProps = { getParentRoute: () => dexLayoutRoute }

export const dexRoutes = dexLayoutRoute.addChildren([
  createRoute({
    path: '/',
    /** Redirect is handled by the `RootLayout` component */
    component: () => <Skeleton width="100%" height={MinHeight.pageContent} />,
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
    component: PageCompensation,
    head: () => ({
      meta: [{ title: 'Compensation - Curve' }],
    }),
    ...layoutProps,
  }),
  createRoute({
    path: '$network/create-pool',
    component: PageCreatePool,
    head: () => ({
      meta: [{ title: 'Create Pool - Curve' }],
    }),
    ...layoutProps,
  }),
  createRoute({
    path: '$network/dashboard',
    component: PageDashboard,
    head: () => ({
      meta: [{ title: 'Dashboard - Curve' }],
    }),
    ...layoutProps,
  }),
  createRoute({
    path: '$network/deploy-gauge',
    component: PageDeployGauge,
    head: () => ({
      meta: [{ title: 'Deploy Gauge - Curve' }],
    }),
    ...layoutProps,
  }),
  createRoute({
    path: '$network/disclaimer',
    component: () => <Disclaimer currentApp="dex" />,
    head: () => ({
      meta: [{ title: 'Risk Disclaimer - Curve' }],
    }),
    ...layoutProps,
  }),
  createRoute({
    path: '$network/integrations',
    component: PageIntegrations,
    head: () => ({
      meta: [{ title: 'Integrations - Curve' }],
    }),
    ...layoutProps,
  }),
  createRoute({
    path: '$network/pools',
    component: PagePoolList,
    head: () => ({
      meta: [{ title: 'Pools - Curve' }],
    }),
    ...layoutProps,
  }),
  createRoute({
    path: '$network/pools/$pool/$formType',
    component: PagePool,
    head: ({ params }) => ({
      meta: [{ title: `Curve - Pool - ${params.pool} - Curve` }],
    }),
    ...layoutProps,
  }),
  createRoute({
    path: '$network/pools/$pool',
    component: PagePool,
    head: ({ params }) => ({
      meta: [{ title: `Curve - Pool - ${params.pool} - Curve` }],
    }),
    ...layoutProps,
  }),
  createRoute({
    path: '$network/swap',
    component: PageRouterSwap,
    head: () => ({
      meta: [{ title: 'Swap - Curve' }],
    }),
    ...layoutProps,
  }),
])
