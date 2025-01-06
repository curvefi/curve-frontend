import { i18n } from '@lingui/core'
import { I18nProvider } from '@lingui/react'
import { OverlayProvider } from '@react-aria/overlays'
import delay from 'lodash/delay'
import { useCallback, useEffect, useState } from 'react'
import 'intersection-observer'
import 'focus-visible'
import '@/globals.css'
import { HashRouter } from 'react-router-dom'
import type { AppProps } from 'next/app'
import { connectWalletLocales, initOnboard } from '@ui-kit/features/connect-wallet'
import { persister, queryClient } from '@ui-kit/lib/api/query-client'
import { ThemeProvider } from 'curve-ui-kit/src/shared/ui/ThemeProvider'
import GlobalStyle from '@/globalStyle'
import Page from '@/layout/index'
import { dynamicActivate, initTranslation } from '@ui-kit/lib/i18n'
import { messages as messagesEn } from '@/locales/en/messages.js'
import networks from '@/networks'
import { getPageWidthClassName } from '@/store/createLayoutSlice'
import useStore from '@/store/useStore'
import { QueryProvider } from '@/ui/QueryProvider'
import { isMobile, removeExtraSpaces } from '@/utils/helpers'
import { getLocaleFromUrl } from '@/utils/utilsRouter'
import { getStorageValue } from '@/utils/utilsStorage'
import { ChadCssProperties } from '@ui-kit/themes/typography'

i18n.load({ en: messagesEn })
i18n.activate('en')

function CurveApp({ Component }: AppProps) {
  const locale = useStore((state) => state.locale)
  const pageWidth = useStore((state) => state.layout.pageWidth)
  const themeType = useStore((state) => state.themeType)
  const setLayoutWidth = useStore((state) => state.layout.setLayoutWidth)
  const updateGlobalStoreByKey = useStore((state) => state.updateGlobalStoreByKey)
  const updateWalletStateByKey = useStore((state) => state.wallet.setStateByKey)

  const [appLoaded, setAppLoaded] = useState(false)

  const handleResizeListener = useCallback(() => {
    updateGlobalStoreByKey('isMobile', isMobile())
    if (window.innerWidth) setLayoutWidth(getPageWidthClassName(window.innerWidth))
  }, [setLayoutWidth, updateGlobalStoreByKey])

  // update on every state change
  useEffect(() => {
    if (!pageWidth) return

    document.body.className = removeExtraSpaces(`theme-${themeType} ${pageWidth} ${isMobile() ? '' : 'scrollSmooth'}`)
    document.documentElement.lang = locale
  })

  // init app
  useEffect(() => {
    const handleScrollListener = () => {
      updateGlobalStoreByKey('scrollY', window.scrollY)
    }

    const { themeType, isAdvanceMode } = getStorageValue('APP_CACHE') ?? {}

    // init advanceMode
    updateGlobalStoreByKey('isAdvanceMode', isAdvanceMode)

    // init theme
    const darkModeQuery = window.matchMedia('(prefers-color-scheme: dark)')
    updateGlobalStoreByKey('themeType', themeType ? themeType : darkModeQuery.matches ? 'dark' : 'light')

    // init locale
    const { rLocale } = getLocaleFromUrl()
    const parsedLocale = rLocale?.value ?? 'en'
    initTranslation(i18n, parsedLocale)
    ;(async () => {
      let data = await import(`@/locales/${parsedLocale}/messages`)
      dynamicActivate(parsedLocale, data)
    })()
    updateGlobalStoreByKey('locale', parsedLocale)

    // init onboard
    const onboardInstance = initOnboard(connectWalletLocales, locale, themeType, networks)
    updateWalletStateByKey('onboard', onboardInstance)

    const handleVisibilityChange = () => {
      updateGlobalStoreByKey('isPageVisible', !document.hidden)
    }

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

  return (
    <div suppressHydrationWarning style={{ ...(themeType === 'chad' && ChadCssProperties) }}>
      <ThemeProvider theme={(themeType as string) === 'default' ? 'light' : themeType}>
        {typeof window === 'undefined' || !appLoaded ? null : (
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
