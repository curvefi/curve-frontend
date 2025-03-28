'use client'
import '@/global-extensions'
import delay from 'lodash/delay'
import { type ReactNode, useCallback, useEffect, useState } from 'react'
import Page from '@/dao/layout'
import networks from '@/dao/networks'
import useStore from '@/dao/store/useStore'
import GlobalStyle from '@/globalStyle'
import { OverlayProvider } from '@react-aria/overlays'
import { getPageWidthClassName, isSuccess } from '@ui/utils'
import { useWallet } from '@ui-kit/features/connect-wallet'
import { useUserProfileStore } from '@ui-kit/features/user-profile'
import usePageVisibleInterval from '@ui-kit/hooks/usePageVisibleInterval'
import { persister, queryClient, QueryProvider } from '@ui-kit/lib/api'
import { REFRESH_INTERVAL } from '@ui-kit/lib/model'
import { ThemeProvider } from '@ui-kit/shared/ui/ThemeProvider'
import { useApiStore } from '@ui-kit/shared/useApiStore'
import { ChadCssProperties } from '@ui-kit/themes/typography'

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
  const curve = useApiStore((state) => state.curve)
  const isPageVisible = useStore((state) => state.isPageVisible)
  const theme = useUserProfileStore((state) => state.theme)
  const { wallet } = useWallet.getState() // note: avoid the hook because we first need to initialize the wallet

  const [appLoaded, setAppLoaded] = useState(false)

  const handleResizeListener = useCallback(() => {
    if (window.innerWidth) setPageWidth(getPageWidthClassName(window.innerWidth))
  }, [setPageWidth])

  useEffect(() => {
    if (!pageWidth) return
    document.body.className = `theme-${theme} ${pageWidth}`.replace(/ +(?= )/g, '').trim()
    document.body.setAttribute('data-theme', theme)
  }, [pageWidth, theme])

  useEffect(() => {
    // reset the whole app state, as internal links leave the store with old state but curveJS is not loaded
    useStore.setState(useStore.getInitialState())

    const handleScrollListener = () => {
      updateShowScrollButton(window.scrollY)
    }

    useWallet.initialize(theme, networks)

    const handleVisibilityChange = () => updateGlobalStoreByKey('isPageVisible', !document.hidden)

    setAppLoaded(true)
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
