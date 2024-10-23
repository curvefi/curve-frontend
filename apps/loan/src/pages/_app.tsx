import { i18n } from '@lingui/core'
import { I18nProvider } from '@lingui/react'
import { OverlayProvider } from '@react-aria/overlays'
import delay from 'lodash/delay'
import 'intersection-observer'
import 'focus-visible'
import '@/globals.css'
import { connectWalletLocales } from '@/common/shared/features/features/connect-wallet/lib'
import { useCallback, useEffect, useState } from 'react'
import { HashRouter } from 'react-router-dom'
import { REFRESH_INTERVAL } from '@/constants'
import GlobalStyle from '@/globalStyle'
import usePageVisibleInterval from '@/hooks/usePageVisibleInterval'
import Page from '@/layout/index'
import type { Locale } from '@/lib/i18n'
import { dynamicActivate, initTranslation } from '@/lib/i18n'
import { messages as messagesEn } from '@/locales/en/messages.js'
import networks from '@/networks'
import { getPageWidthClassName } from '@/store/createLayoutSlice'
import useStore from '@/store/useStore'
import { isMobile, removeExtraSpaces } from '@/utils/helpers'
import { getStorageValue } from '@/utils/storage'
import { getLocaleFromUrl } from '@/utils/utilsRouter'
import type { AppProps } from 'next/app'
import { initOnboard } from '@/common/shared/features/features/connect-wallet/lib/init'

i18n.load({ en: messagesEn })
i18n.activate('en')

function CurveApp({ Component }: AppProps) {
  const curve = useStore((state) => state.curve)
  const isPageVisible = useStore((state) => state.isPageVisible)
  const locale = useStore((state) => state.locale)
  const pageWidth = useStore((state) => state.layout.pageWidth)
  const themeType = useStore((state) => state.themeType)
  const fetchAllStoredUsdRates = useStore((state) => state.usdRates.fetchAllStoredUsdRates)
  const fetchCrvUSDTotalSupply = useStore((state) => state.fetchCrvUSDTotalSupply)
  const fetchGasInfo = useStore((state) => state.gas.fetchGasInfo)
  const setLayoutWidth = useStore((state) => state.layout.setLayoutWidth)
  const updateGlobalStoreByKey = useStore((state) => state.updateGlobalStoreByKey)
  const updateWalletStateByKey = useStore((state) => state.wallet.setStateByKey)

  const [appLoaded, setAppLoaded] = useState(false)

  const handleResizeListener = useCallback(() => {
    updateGlobalStoreByKey('isMobile', isMobile())
    if (window.innerWidth) setLayoutWidth(getPageWidthClassName(window.innerWidth))
  }, [setLayoutWidth, updateGlobalStoreByKey])

  const initOnboardApi = useCallback(
    async (locale: Locale['value'], themeType?: Theme) => {
      let theme = 'system'
      if (themeType === 'default' || themeType === 'chad') {
        theme = 'light'
      } else if (themeType === 'dark') {
        theme = 'dark'
      }

      const onboardInstance = initOnboard(connectWalletLocales, locale, theme, networks)
      updateWalletStateByKey('onboard', onboardInstance)
    },
    [updateWalletStateByKey]
  )

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
    updateGlobalStoreByKey('themeType', themeType ? themeType : darkModeQuery.matches ? 'dark' : 'default')

    // init locale
    const { rLocale } = getLocaleFromUrl()
    const parsedLocale = rLocale?.value ?? 'en'
    initTranslation(i18n, parsedLocale)
    dynamicActivate(parsedLocale)
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

  usePageVisibleInterval(
    () => {
      if (isPageVisible && curve) {
        fetchAllStoredUsdRates(curve)
        fetchGasInfo(curve)
        fetchCrvUSDTotalSupply(curve)
      }
    },
    REFRESH_INTERVAL['5m'],
    isPageVisible
  )

  return (
    <div suppressHydrationWarning>
      {typeof window === 'undefined' || !appLoaded ? null : (
        <HashRouter>
          <I18nProvider i18n={i18n}>
            <OverlayProvider>
              <Page>
                <Component />
              </Page>
              <GlobalStyle />
            </OverlayProvider>
          </I18nProvider>
        </HashRouter>
      )}
    </div>
  )
}

export default CurveApp
