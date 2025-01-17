import { i18n } from '@lingui/core'
import { I18nProvider } from '@lingui/react'
import { OverlayProvider } from '@react-aria/overlays'
import delay from 'lodash/delay'
import 'intersection-observer'
import 'focus-visible'
import '@loan/globals.css'
import { useCallback, useEffect, useState } from 'react'
import { HashRouter } from 'react-router-dom'
import type { AppProps } from 'next/app'
import { connectWalletLocales, initOnboard } from '@ui-kit/features/connect-wallet'
import { REFRESH_INTERVAL } from '@loan/constants'
import GlobalStyle from '@loan/globalStyle'
import usePageVisibleInterval from '@loan/hooks/usePageVisibleInterval'
import Page from '@loan/layout/index'
import { dynamicActivate, initTranslation } from '@ui-kit/lib/i18n'
import { messages as messagesEn } from '@loan/locales/en/messages.js'
import networks from '@loan/networks'
import { getPageWidthClassName } from '@loan/store/createLayoutSlice'
import useStore from '@loan/store/useStore'
import { isMobile, removeExtraSpaces } from '@loan/utils/helpers'
import { getLocaleFromUrl } from '@loan/utils/utilsRouter'
import { ThemeProvider } from '@ui-kit/shared/ui/ThemeProvider'
import { ChadCssProperties } from '@ui-kit/themes/typography'
import { persister, queryClient } from '@ui-kit/lib/api/query-client'
import { QueryProvider } from '@ui/QueryProvider'
import { useUserProfileStore } from '@ui-kit/features/user-profile'

i18n.load({ en: messagesEn })
i18n.activate('en')

function CurveApp({ Component }: AppProps) {
  const curve = useStore((state) => state.curve)
  const isPageVisible = useStore((state) => state.isPageVisible)
  const pageWidth = useStore((state) => state.layout.pageWidth)
  const fetchAllStoredUsdRates = useStore((state) => state.usdRates.fetchAllStoredUsdRates)
  const fetchCrvUSDTotalSupply = useStore((state) => state.fetchCrvUSDTotalSupply)
  const fetchGasInfo = useStore((state) => state.gas.fetchGasInfo)
  const setLayoutWidth = useStore((state) => state.layout.setLayoutWidth)
  const updateGlobalStoreByKey = useStore((state) => state.updateGlobalStoreByKey)
  const updateWalletStateByKey = useStore((state) => state.wallet.setStateByKey)

  const theme = useUserProfileStore((state) => state.theme)
  const locale = useUserProfileStore((state) => state.locale)

  const [appLoaded, setAppLoaded] = useState(false)

  const handleResizeListener = useCallback(() => {
    updateGlobalStoreByKey('isMobile', isMobile())
    if (window.innerWidth) setLayoutWidth(getPageWidthClassName(window.innerWidth))
  }, [setLayoutWidth, updateGlobalStoreByKey])

  // update on every state change
  useEffect(() => {
    if (!pageWidth) return

    document.body.className = removeExtraSpaces(`theme-${theme} ${pageWidth} ${isMobile() ? '' : 'scrollSmooth'}`)
    document.documentElement.lang = locale
  })

  // init app
  useEffect(() => {
    const handleScrollListener = () => {
      updateGlobalStoreByKey('scrollY', window.scrollY)
    }

    // init locale
    const { rLocale } = getLocaleFromUrl()
    const parsedLocale = rLocale?.value ?? 'en'
    initTranslation(i18n, parsedLocale)
    ;(async () => {
      let data = await import(`@loan/locales/${parsedLocale}/messages`)
      dynamicActivate(parsedLocale, data)
    })()

    // init onboard
    const onboardInstance = initOnboard(connectWalletLocales, locale, theme, networks)
    updateWalletStateByKey('onboard', onboardInstance)

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
        fetchCrvUSDTotalSupply(curve)
      }
    },
    REFRESH_INTERVAL['5m'],
    isPageVisible,
  )

  return (
    <div suppressHydrationWarning style={{ ...(theme === 'chad' && ChadCssProperties) }}>
      <ThemeProvider theme={theme}>
        {typeof window !== 'undefined' && appLoaded && (
          <HashRouter>
            <I18nProvider i18n={i18n}>
              <QueryProvider persister={persister} queryClient={queryClient}>
                <OverlayProvider>
                  <Page>
                    <Component />
                  </Page>
                  <GlobalStyle />
                </OverlayProvider>
              </QueryProvider>
            </I18nProvider>
          </HashRouter>
        )}
      </ThemeProvider>
    </div>
  )
}

export default CurveApp
