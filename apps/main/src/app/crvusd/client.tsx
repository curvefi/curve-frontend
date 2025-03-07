'use client'
import '@/global-extensions'
import delay from 'lodash/delay'
import { useCallback, useEffect, useState, type ReactNode } from 'react'
import GlobalStyle from '@/globalStyle'
import Page from '@/loan/layout'
import networks from '@/loan/networks'
import { getPageWidthClassName } from '@/loan/store/createLayoutSlice'
import useStore from '@/loan/store/useStore'
import { isMobile, removeExtraSpaces } from '@/loan/utils/helpers'
import { useWallet } from '@ui-kit/features/connect-wallet'
import { useUserProfileStore } from '@ui-kit/features/user-profile'
import usePageVisibleInterval from '@ui-kit/hooks/usePageVisibleInterval'
import { persister, queryClient, QueryProvider } from '@ui-kit/lib/api'
import { REFRESH_INTERVAL } from '@ui-kit/lib/model'
import { ThemeProvider } from '@ui-kit/shared/ui/ThemeProvider'
import { ChadCssProperties } from '@ui-kit/themes/typography'

export const App = ({ children }: { children: ReactNode }) => {
  const curve = useStore((state) => state.curve)
  const isPageVisible = useStore((state) => state.isPageVisible)
  const pageWidth = useStore((state) => state.layout.pageWidth)
  const fetchAllStoredUsdRates = useStore((state) => state.usdRates.fetchAllStoredUsdRates)
  const fetchGasInfo = useStore((state) => state.gas.fetchGasInfo)
  const setLayoutWidth = useStore((state) => state.layout.setLayoutWidth)
  const updateGlobalStoreByKey = useStore((state) => state.updateGlobalStoreByKey)
  const theme = useUserProfileStore((state) => state.theme)

  const [appLoaded, setAppLoaded] = useState(false)

  const handleResizeListener = useCallback(() => {
    updateGlobalStoreByKey('isMobile', isMobile())
    if (window.innerWidth) setLayoutWidth(getPageWidthClassName(window.innerWidth))
  }, [setLayoutWidth, updateGlobalStoreByKey])

  // update on every state change
  useEffect(() => {
    if (!pageWidth) return
    document.body.className = removeExtraSpaces(`theme-${theme} ${pageWidth} ${isMobile() ? '' : 'scrollSmooth'}`)
  })

  // init app
  useEffect(() => {
    const handleScrollListener = () => {
      updateGlobalStoreByKey('scrollY', window.scrollY)
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

  usePageVisibleInterval(
    () => {
      if (isPageVisible && curve) {
        fetchAllStoredUsdRates(curve)
        fetchGasInfo(curve)
      }
    },
    REFRESH_INTERVAL['5m'],
    isPageVisible,
  )

  return (
    <div suppressHydrationWarning style={{ ...(theme === 'chad' && ChadCssProperties) }}>
      <GlobalStyle />
      <ThemeProvider theme={theme}>
        {appLoaded && (
          <QueryProvider persister={persister} queryClient={queryClient}>
            <Page>{children}</Page>
          </QueryProvider>
        )}
      </ThemeProvider>
    </div>
  )
}
