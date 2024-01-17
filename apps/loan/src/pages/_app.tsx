import type { AppProps } from 'next/app'

import { useCallback, useEffect } from 'react'
import { HashRouter } from 'react-router-dom'
import { i18n } from '@lingui/core'
import { I18nProvider } from '@lingui/react'
import { OverlayProvider } from '@react-aria/overlays'
import delay from 'lodash/delay'
import dynamic from 'next/dynamic'
import 'intersection-observer'
import 'focus-visible'
import '@/globals.css'

import { dynamicActivate, initTranslation, Locale, parseLocale } from '@/lib/i18n'
import { isMobile, removeExtraSpaces } from '@/utils/helpers'
import { getPageWidthClassName } from '@/store/createLayoutSlice'
import { getStorageValue } from '@/utils/storage'
import { REFRESH_INTERVAL } from '@/constants'
import { initOnboard } from 'onboard-helpers'
import { messages as messagesEn } from '@/locales/en/messages.js'
import networks from '@/networks'
import usePageVisibleInterval from '@/hooks/usePageVisibleInterval'
import useStore from '@/store/useStore'
import zhHans from 'onboard-helpers/src/locales/zh-Hans'
import zhHant from 'onboard-helpers/src/locales/zh-Hant'

import Page from '@/layout/index'
import GlobalStyle from '@/globalStyle'

const NetworkProvider = dynamic(() => import('@/components/NetworkProvider'), { ssr: false })

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

  const handleResizeListener = useCallback(() => {
    updateGlobalStoreByKey('isMobile', isMobile())
    const pageWidth = window.innerWidth

    if (pageWidth) {
      let updatedPageWidthClassName

      if (pageWidth > 1920) {
        updatedPageWidthClassName = 'page-wide'
      } else if (pageWidth > 1280 && pageWidth <= 1920) {
        updatedPageWidthClassName = 'page-large'
      } else if (pageWidth > 960 && pageWidth <= 1280) {
        updatedPageWidthClassName = 'page-medium'
      } else if (pageWidth > 450 && pageWidth <= 960) {
        updatedPageWidthClassName = 'page-small'
      } else if (pageWidth > 321 && pageWidth <= 450) {
        updatedPageWidthClassName = 'page-small-x'
      } else {
        updatedPageWidthClassName = 'page-small-xx'
      }

      if (updatedPageWidthClassName) {
        setLayoutWidth(updatedPageWidthClassName as PageWidthClassName)
      }
    }
  }, [setLayoutWidth, updateGlobalStoreByKey])

  const initOnboardApi = useCallback(
    async (locale: Locale['value'], themeType?: Theme) => {
      let theme = 'system'
      if (themeType === 'default' || themeType === 'chad') {
        theme = 'light'
      } else if (themeType === 'dark') {
        theme = 'dark'
      }

      const onboardInstance = initOnboard(
        {
          'zh-Hans': zhHans,
          'zh-Hant': zhHant,
        },
        locale,
        theme,
        networks
      )
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

    const { locale, themeType, isAdvanceMode } = getStorageValue('APP_CACHE') ?? {}

    // init advanceMode
    updateGlobalStoreByKey('isAdvanceMode', isAdvanceMode)

    // init theme
    const darkModeQuery = window.matchMedia('(prefers-color-scheme: dark)')
    updateGlobalStoreByKey('themeType', themeType ? themeType : darkModeQuery.matches ? 'dark' : 'default')

    // init locale
    const { parsedLocale } = parseLocale(locale)
    initTranslation(i18n, parsedLocale)
    dynamicActivate(parsedLocale)
    updateGlobalStoreByKey('locale', parsedLocale)

    // init onboard
    initOnboardApi(parsedLocale, themeType)

    // layout sizes
    const pageWidth = window.innerWidth
    const pageWidthClassName = getPageWidthClassName(pageWidth)
    setLayoutWidth(pageWidthClassName)

    const handleVisibilityChange = () => {
      updateGlobalStoreByKey('isPageVisible', !document.hidden)
    }

    handleResizeListener()
    updateGlobalStoreByKey('scrollY', 0)
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
      {typeof window === 'undefined' ? null : (
        <HashRouter>
          <NetworkProvider>
            <I18nProvider i18n={i18n}>
              <OverlayProvider>
                <Page>
                  <Component curve={curve} />
                </Page>
                <GlobalStyle />
              </OverlayProvider>
            </I18nProvider>
          </NetworkProvider>
        </HashRouter>
      )}
    </div>
  )
}

export default CurveApp
