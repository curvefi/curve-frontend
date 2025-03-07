'use client'
import '@/global-extensions'
import type { NextPage } from 'next'
import { Navigate, Route, Routes } from 'react-router'
import { ROUTE } from '@/dao/constants'
import dynamic from 'next/dynamic'
import { useCallback, useEffect, useState } from 'react'
import { HashRouter } from 'react-router-dom'
import { OverlayProvider } from '@react-aria/overlays'
import delay from 'lodash/delay'
import { ThemeProvider } from '@ui-kit/shared/ui/ThemeProvider'
import { getIsMobile, getPageWidthClassName, isSuccess } from '@ui/utils'
import networks from '@/dao/networks'
import useStore from '@/dao/store/useStore'
import usePageVisibleInterval from '@ui-kit/hooks/usePageVisibleInterval'
import Page from '@/dao/layout'
import GlobalStyle from '@/globalStyle'
import { ChadCssProperties } from '@ui-kit/themes/typography'
import { useUserProfileStore } from '@ui-kit/features/user-profile'
import { useWallet } from '@ui-kit/features/connect-wallet'
import { shouldForwardProp } from '@ui/styled-containers'
import { StyleSheetManager } from 'styled-components'
import { REFRESH_INTERVAL } from '@ui-kit/lib/model'

const Page404 = dynamic(() => import('@/dao/components/Page404/Page'), { ssr: false })
const PageDao = dynamic(() => import('@/dao/components/PageProposals/Page'), { ssr: false })
const PageProposal = dynamic(() => import('@/dao/components/PageProposal/Page'), { ssr: false })
const PageGauges = dynamic(() => import('@/dao/components/PageGauges/Page'), { ssr: false })
const PageAnalytics = dynamic(() => import('@/dao/components/PageAnalytics/Page'), { ssr: false })
const PageUser = dynamic(() => import('@/dao/components/PageUser/Page'), { ssr: false })
const PageGauge = dynamic(() => import('@/dao/components/PageGauge/Page'), { ssr: false })
const PageVeCrv = dynamic(() => import('@/dao/components/PageVeCrv/Page'), { ssr: false })
const PageDisclaimer = dynamic(() => import('@/dao/components/PageDisclaimer/Page'), { ssr: false })

export const App: NextPage = () => {
  const connectState = useStore((state) => state.connectState)
  const pageWidth = useStore((state) => state.layout.pageWidth)
  const setPageWidth = useStore((state) => state.layout.setLayoutWidth)
  const updateShowScrollButton = useStore((state) => state.updateShowScrollButton)
  const updateGlobalStoreByKey = useStore((state) => state.updateGlobalStoreByKey)
  const updateUserData = useStore((state) => state.user.updateUserData)
  const getProposals = useStore((state) => state.proposals.getProposals)
  const getGauges = useStore((state) => state.gauges.getGauges)
  const getGaugesData = useStore((state) => state.gauges.getGaugesData)
  const fetchAllStoredUsdRates = useStore((state) => state.usdRates.fetchAllStoredUsdRates)
  const curve = useStore((state) => state.curve)
  const isPageVisible = useStore((state) => state.isPageVisible)
  const theme = useUserProfileStore((state) => state.theme)
  const { wallet } = useWallet.getState() // note: avoid the hook because we first need to initialize the wallet

  const [appLoaded, setAppLoaded] = useState(false)

  const handleResizeListener = useCallback(() => {
    updateGlobalStoreByKey('isMobile', getIsMobile())
    if (window.innerWidth) setPageWidth(getPageWidthClassName(window.innerWidth))
  }, [setPageWidth, updateGlobalStoreByKey])

  useEffect(() => {
    if (!pageWidth) return
    document.body.className = `theme-${theme} ${pageWidth} ${getIsMobile() ? '' : 'scrollSmooth'}`
    document.body.setAttribute('data-theme', theme)
  })

  useEffect(() => {
    const handleScrollListener = () => {
      updateShowScrollButton(window.scrollY)
    }

    useWallet.initialize(theme, networks)

    const handleVisibilityChange = () => updateGlobalStoreByKey('isPageVisible', !document.hidden)

    setAppLoaded(true)
    updateGlobalStoreByKey('loaded', true)
    handleResizeListener()
    handleVisibilityChange()

    document.addEventListener('visibilitychange', handleVisibilityChange)
    window.addEventListener('resize', () => handleResizeListener())
    window.addEventListener('scroll', () => delay(handleScrollListener, 200))

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      window.removeEventListener('resize', () => handleResizeListener())
      window.removeEventListener('scroll', () => handleScrollListener())
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (isSuccess(connectState) && curve && wallet) {
      updateUserData(curve, wallet)
    }
  }, [curve, connectState, updateUserData, wallet])

  // initiate proposals list
  useEffect(() => {
    getProposals()
    getGauges()
    getGaugesData()
  }, [getGauges, getProposals, getGaugesData])

  useEffect(() => {
    if (curve) {
      fetchAllStoredUsdRates(curve)
    }
  }, [curve, fetchAllStoredUsdRates])

  usePageVisibleInterval(
    () => {
      if (curve) {
        fetchAllStoredUsdRates(curve)
      }
      getProposals()
      getGauges()
      getGaugesData()
    },
    REFRESH_INTERVAL['5m'],
    isPageVisible,
  )

  const SubRoutes = (
    <>
      <Route path=":network/" element={<PageDao />} />
      <Route path=":network/disclaimer" element={<PageDisclaimer />} />
      <Route path=":network/proposals" element={<PageDao />} />
      <Route path=":network/proposals/:proposalId" element={<PageProposal />} />
      <Route path=":network/user/:userAddress" element={<PageUser />} />
      <Route path=":network/analytics" element={<PageAnalytics />} />
      <Route path=":network/vecrv/:formType" element={<PageVeCrv />} />
      <Route path=":network/gauges" element={<PageGauges />} />
      <Route path=":network/gauges/:gaugeAddress" element={<PageGauge />} />
    </>
  )

  return (
    <div suppressHydrationWarning style={{ ...(theme === 'chad' && ChadCssProperties) }}>
      <ThemeProvider theme={theme}>
        {typeof window === 'undefined' || !appLoaded ? null : (
          <HashRouter>
            <StyleSheetManager shouldForwardProp={shouldForwardProp}>
              <OverlayProvider>
                <Page>
                  <Routes>
                    {SubRoutes}
                    <Route path="/" element={<Navigate to={`/ethereum${ROUTE.PAGE_PROPOSALS}`} replace />} />
                    <Route path="/proposals/*" element={<Navigate to={`/ethereum${ROUTE.PAGE_PROPOSALS}`} replace />} />
                    <Route path="/user/*" element={<Navigate to={`/ethereum${ROUTE.PAGE_USER}`} replace />} />
                    <Route path="/gauges/*" element={<Navigate to={`/ethereum${ROUTE.PAGE_GAUGES}`} replace />} />
                    <Route path="/analytics/*" element={<Navigate to={`/ethereum${ROUTE.PAGE_ANALYTICS}`} replace />} />
                    <Route path="/vecrv/*" element={<Navigate to={`/ethereum${ROUTE.PAGE_VECRV_CREATE}`} replace />} />
                    <Route path="404" element={<Page404 />} />
                    <Route path="*" element={<Page404 />} />
                  </Routes>
                </Page>
                <GlobalStyle />
              </OverlayProvider>
            </StyleSheetManager>
          </HashRouter>
        )}
      </ThemeProvider>
    </div>
  )
}
