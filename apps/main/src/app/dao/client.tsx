'use client'
import '@/global-extensions'
import { Route } from 'react-router'
import { REFRESH_INTERVAL } from '@/dao/constants'
import dynamic from 'next/dynamic'
import { type ReactNode, useCallback, useEffect, useState } from 'react'
import { OverlayProvider } from '@react-aria/overlays'
import delay from 'lodash/delay'
import { ThemeProvider } from '@ui-kit/shared/ui/ThemeProvider'
import { getIsMobile, getPageWidthClassName, isSuccess } from '@ui/utils'
import networks from '@/dao/networks'
import useStore from '@/dao/store/useStore'
import usePageVisibleInterval from '@/dao/hooks/usePageVisibleInterval'
import Page from '@/dao/layout'
import GlobalStyle from '@/dao/globalStyle'
import { ChadCssProperties } from '@ui-kit/themes/typography'
import { useUserProfileStore } from '@ui-kit/features/user-profile'
import { useWallet } from '@ui-kit/features/connect-wallet'
import { QueryProvider } from '@ui/QueryProvider'
import { persister, queryClient } from '@ui-kit/lib/api/query-client'

export const App = ({ children }: { children: ReactNode }) => {
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

  return (
    <div suppressHydrationWarning style={{ ...(theme === 'chad' && ChadCssProperties) }}>
      <GlobalStyle />
      <ThemeProvider theme={theme}>
        {appLoaded && (
          <OverlayProvider>
            <QueryProvider persister={persister} queryClient={queryClient}>
              <Page>{children}</Page>
            </QueryProvider>
          </OverlayProvider>
        )}
      </ThemeProvider>
    </div>
  )
}
