import type { NextPage } from 'next'
import dynamic from 'next/dynamic'
import { Navigate, Route, Routes, useParams } from 'react-router'
import { REFRESH_INTERVAL, ROUTE } from '@/dex/constants'
import { OverlayProvider } from '@react-aria/overlays'
import delay from 'lodash/delay'
import { useCallback, useEffect, useState } from 'react'
import { HashRouter } from 'react-router-dom'
import { persister, queryClient } from '@ui-kit/lib/api/query-client'
import { ThemeProvider } from '@ui-kit/shared/ui/ThemeProvider'
import GlobalStyle from '@/dex/globalStyle'
import usePageVisibleInterval from '@/dex/hooks/usePageVisibleInterval'
import Page from '@/dex/layout/default'
import curvejsApi from '@/dex/lib/curvejs'
import useStore from '@/dex/store/useStore'
import { QueryProvider } from '@ui/QueryProvider'
import { isMobile, removeExtraSpaces } from '@/dex/utils'
import { ChadCssProperties } from '@ui-kit/themes/typography'
import { useUserProfileStore } from '@ui-kit/features/user-profile'
import { CurveApi } from '@/dex/types/main.types'
import { useWallet } from '@ui-kit/features/connect-wallet'
import { shouldForwardProp } from '@ui/styled-containers'
import { StyleSheetManager } from 'styled-components'

const PageDashboard = dynamic(() => import('@/dex/components/PageDashboard/Page'), { ssr: false })
const PageLockedCrv = dynamic(() => import('@/dex/components/PageCrvLocker/Page'), { ssr: false })
const PagePoolTransfer = dynamic(() => import('@/dex/components/PagePool/Page'), { ssr: false })
const PagePools = dynamic(() => import('@/dex/components/PagePoolList/Page'), { ssr: false })
const PageSwap = dynamic(() => import('@/dex/components/PageRouterSwap/Page'), { ssr: false })
const Page404 = dynamic(() => import('@/dex/components/Page404/Page'), { ssr: false })
const PageCreatePool = dynamic(() => import('@/dex/components/PageCreatePool/Page'), { ssr: false })
const PageDeployGauge = dynamic(() => import('@/dex/components/PageDeployGauge/Page'), { ssr: false })
const PageIntegrations = dynamic(() => import('@/dex/components/PageIntegrations/Page'), { ssr: false })
const PageCompensation = dynamic(() => import('@/dex/components/PageCompensation/Page'), { ssr: false })
const PageDisclaimer = dynamic(() => import('@/dex/components/PageDisclaimer/Page'), { ssr: false })

export const getServerSideProps = async () => ({ props: { server: await Promise.resolve('dex') } })

const App: NextPage<Awaited<ReturnType<typeof getServerSideProps>>['props']> = ({ server }) => {
  server && console.log('server', server)
  const curve = useStore((state) => state.curve)
  const chainId = curve?.chainId ?? ''
  const isPageVisible = useStore((state) => state.isPageVisible)
  const pageWidth = useStore((state) => state.pageWidth)
  const poolDataMapper = useStore((state) => state.pools.poolsMapper[chainId])
  const setPageWidth = useStore((state) => state.setPageWidth)
  const fetchNetworks = useStore((state) => state.networks.fetchNetworks)
  const fetchPools = useStore((state) => state.pools.fetchPools)
  const fetchPoolsVolume = useStore((state) => state.pools.fetchPoolsVolume)
  const fetchPoolsTvl = useStore((state) => state.pools.fetchPoolsTvl)
  const fetchGasInfo = useStore((state) => state.gas.fetchGasInfo)
  const fetchAllStoredUsdRates = useStore((state) => state.usdRates.fetchAllStoredUsdRates)
  const fetchAllStoredBalances = useStore((state) => state.userBalances.fetchAllStoredBalances)
  const setTokensMapper = useStore((state) => state.tokens.setTokensMapper)
  const updateShowScrollButton = useStore((state) => state.updateShowScrollButton)
  const updateGlobalStoreByKey = useStore((state) => state.updateGlobalStoreByKey)
  const network = useStore((state) => state.networks.networks[chainId])
  const theme = useUserProfileStore((state) => state.theme)

  const [appLoaded, setAppLoaded] = useState(false)

  const handleResizeListener = useCallback(() => {
    updateGlobalStoreByKey('isMobile', isMobile())
    if (window.innerWidth) setPageWidth(window.innerWidth)
  }, [setPageWidth, updateGlobalStoreByKey])

  const fetchPoolsVolumeTvl = useCallback(
    async (curve: CurveApi) => {
      const { chainId } = curve
      const poolDatas = Object.values(poolDataMapper)
      await Promise.all([fetchPoolsVolume(chainId, poolDatas), fetchPoolsTvl(curve, poolDatas)])
      setTokensMapper(chainId, poolDatas)
    },
    [fetchPoolsTvl, fetchPoolsVolume, poolDataMapper, setTokensMapper],
  )

  useEffect(() => {
    if (!pageWidth) return

    document.body.className = removeExtraSpaces(`theme-${theme} ${pageWidth} ${isMobile() ? '' : 'scrollSmooth'}`)
    document.body.setAttribute('data-theme', theme)
  })

  useEffect(() => {
    ;(async () => {
      const networks = await fetchNetworks()

      useWallet.initialize(theme, networks)

      const handleVisibilityChange = () => {
        updateGlobalStoreByKey('isPageVisible', !document.hidden)
      }

      setAppLoaded(true)
      updateGlobalStoreByKey('loaded', true)
      handleResizeListener()
      handleVisibilityChange()

      document.addEventListener('visibilitychange', handleVisibilityChange)
      window.addEventListener('resize', () => handleResizeListener())
      window.addEventListener('scroll', () => delay(() => updateShowScrollButton(window.scrollY), 200))
    })()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const refetchPools = useCallback(
    async (curve: CurveApi) => {
      const poolIds = await curvejsApi.network.fetchAllPoolsList(curve, network)
      fetchPools(curve, poolIds, null)
    },
    [fetchPools, network],
  )

  usePageVisibleInterval(
    () => {
      if (curve) {
        fetchGasInfo(curve)
        fetchAllStoredUsdRates(curve)
        fetchPoolsVolumeTvl(curve)

        if (curve.signerAddress) {
          fetchAllStoredBalances(curve)
        }
      }
    },
    REFRESH_INTERVAL['5m'],
    isPageVisible,
  )

  usePageVisibleInterval(
    () => {
      if (curve) {
        refetchPools(curve)
      }
    },
    REFRESH_INTERVAL['11m'],
    isPageVisible,
  )

  /**
   * Lazily use useParams() to preserve network parameter during redirects.
   * Using Navigate instead of direct component rendering ensures proper
   * menu highlighting via isActive state.
   */
  const RootRedirect = () => {
    const { network } = useParams()
    return <Navigate to={`/${network ?? 'ethereum'}/pools`} />
  }

  const SubRoutes = (
    <>
      <Route path=":network" element={<RootRedirect />} />
      <Route path=":network/dashboard" element={<PageDashboard />} />
      <Route path=":network/locker" element={<PageLockedCrv />} />
      <Route path=":network/locker/:lockedCrvFormType" element={<PageLockedCrv />} />
      <Route path=":network/create-pool" element={<PageCreatePool />} />
      <Route path=":network/deploy-gauge" element={<PageDeployGauge />} />
      <Route path=":network/integrations" element={<PageIntegrations />} />
      <Route path=":network/pools" element={<PagePools />} />
      <Route path=":network/pools/:pool" element={<Navigate to="deposit" replace />} />
      <Route path=":network/pools/:pool/:transfer" element={<PagePoolTransfer />} />
      <Route path=":network/swap" element={<PageSwap />} />
      <Route path=":network/compensation" element={<PageCompensation />} />
      <Route path=":network/disclaimer" element={<PageDisclaimer />} />
    </>
  )

  return (
    <div suppressHydrationWarning style={{ ...(theme === 'chad' && ChadCssProperties) }}>
      <ThemeProvider theme={theme}>
        {typeof window === 'undefined' || !appLoaded ? null : (
          <HashRouter>
            <StyleSheetManager shouldForwardProp={shouldForwardProp}>
              <QueryProvider persister={persister} queryClient={queryClient}>
                <OverlayProvider>
                  <Page>
                    <Routes>
                      {SubRoutes}
                      <Route path="/dashboard" element={<Navigate to={`/ethereum${ROUTE.PAGE_DASHBOARD}`} replace />} />
                      <Route
                        path="/deploy-gauge"
                        element={<Navigate to={`/ethereum${ROUTE.PAGE_DEPLOY_GAUGE}`} replace />}
                      />
                      <Route path="/locker" element={<Navigate to={`/ethereum${ROUTE.PAGE_LOCKER}`} replace />} />
                      <Route
                        path="/create-pool"
                        element={<Navigate to={`/ethereum${ROUTE.PAGE_CREATE_POOL}`} replace />}
                      />
                      <Route path="/integrations" element={<PageIntegrations />} />
                      <Route path="/pools/*" element={<Navigate to={`/ethereum${ROUTE.PAGE_POOLS}`} replace />} />
                      <Route path="/swap" element={<Navigate to={`/ethereum${ROUTE.PAGE_SWAP}`} replace />} />
                      <Route
                        path="/compensation"
                        element={<Navigate to={`/ethereum${ROUTE.PAGE_COMPENSATION}`} replace />}
                      />
                      <Route
                        path="/disclaimer"
                        element={<Navigate to={`/ethereum${ROUTE.PAGE_DISCLAIMER}`} replace />}
                      />
                      <Route path="/" element={<Navigate to={`/ethereum${ROUTE.PAGE_POOLS}`} />} />
                      <Route path="404" element={<Page404 />} />
                      <Route path="*" element={<Page404 />} />
                    </Routes>
                  </Page>
                  <GlobalStyle />
                </OverlayProvider>
              </QueryProvider>
            </StyleSheetManager>
          </HashRouter>
        )}
      </ThemeProvider>
    </div>
  )
}

export default App
