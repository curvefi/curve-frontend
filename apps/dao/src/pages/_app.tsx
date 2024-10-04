import type { AppProps } from 'next/app'

import { useCallback, useEffect, useState } from 'react'
import { HashRouter } from 'react-router-dom'
import { i18n } from '@lingui/core'
import { I18nProvider } from '@lingui/react'
import { I18nProvider as AriaI18nProvider } from 'react-aria'
import { OverlayProvider } from '@react-aria/overlays'
import delay from 'lodash/delay'
import 'intersection-observer'
import 'focus-visible'
import '@/globals.css'

import { dynamicActivate, initTranslation, updateAppLocale } from '@/lib/i18n'
import { getLocaleFromUrl, getStorageValue } from '@/utils'
import { getIsMobile, getPageWidthClassName, isSuccess } from '@/ui/utils'
import { initOnboard } from '@/onboard'
import { messages as messagesEn } from '@/locales/en/messages.js'
import networks from '@/networks'
import useStore from '@/store/useStore'
import zhHans from 'onboard-helpers/src/locales/zh-Hans'
import zhHant from 'onboard-helpers/src/locales/zh-Hant'
import { REFRESH_INTERVAL } from '@/constants'
import usePageVisibleInterval from '@/hooks/usePageVisibleInterval'

import Page from '@/layout'
import GlobalStyle from '@/globalStyle'

i18n.load({ en: messagesEn })
i18n.activate('en')

function CurveApp({ Component }: AppProps) {
  const connectState = useStore((state) => state.connectState)
  const locale = useStore((state) => state.locale)
  const pageWidth = useStore((state) => state.pageWidth)
  const themeType = useStore((state) => state.themeType)
  const setPageWidth = useStore((state) => state.setPageWidth)
  const updateShowScrollButton = useStore((state) => state.updateShowScrollButton)
  const updateGlobalStoreByKey = useStore((state) => state.updateGlobalStoreByKey)
  const updateWalletStoreByKey = useStore((state) => state.wallet.setStateByKey)
  const updateUserData = useStore((state) => state.user.updateUserData)
  const getProposals = useStore((state) => state.proposals.getProposals)
  const getGauges = useStore((state) => state.gauges.getGauges)
  const curve = useStore((state) => state.curve)
  const onboard = useStore((state) => state.wallet.onboard)
  const isPageVisible = useStore((state) => state.isPageVisible)

  const [appLoaded, setAppLoaded] = useState(false)

  const handleResizeListener = useCallback(() => {
    updateGlobalStoreByKey('isMobile', getIsMobile())
    if (window.innerWidth) setPageWidth(getPageWidthClassName(window.innerWidth))
  }, [setPageWidth, updateGlobalStoreByKey])

  useEffect(() => {
    if (!pageWidth) return

    document.body.className = `theme-${themeType} ${pageWidth} ${getIsMobile() ? '' : 'scrollSmooth'}`
    document.body.setAttribute('data-theme', themeType || '')
    document.documentElement.lang = locale
  })

  useEffect(() => {
    const handleScrollListener = () => {
      updateShowScrollButton(window.scrollY)
    }

    const { themeType } = getStorageValue('APP_CACHE') ?? {}

    // init theme
    const darkModeQuery = window.matchMedia('(prefers-color-scheme: dark)')
    updateGlobalStoreByKey('themeType', themeType ? themeType : darkModeQuery.matches ? 'dark' : 'default')

    // init locale
    const { rLocale } = getLocaleFromUrl()
    const parsedLocale = rLocale?.value ?? 'en'
    initTranslation(i18n, parsedLocale)
    dynamicActivate(parsedLocale)
    updateAppLocale(parsedLocale, updateGlobalStoreByKey)

    // init onboard
    const onboardInstance = initOnboard(
      {
        'zh-Hans': zhHans,
        'zh-Hant': zhHant,
      },
      locale,
      themeType,
      networks
    )
    updateWalletStoreByKey('onboard', onboardInstance)

    const handleVisibilityChange = () => {
      updateGlobalStoreByKey('isPageVisible', !document.hidden)
    }

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
    if (isSuccess(connectState) && curve && onboard) {
      const updateUserDataIfReady = async () => {
        const connectedWallets = onboard.state.get().wallets
        if (connectedWallets.length > 0) {
          updateUserData(curve, connectedWallets[0])
        }
      }

      updateUserDataIfReady()
    }
  }, [curve, connectState, updateUserData, onboard])

  // initiate proposals list
  useEffect(() => {
    getProposals()
    getGauges()
  }, [getGauges, getProposals])

  usePageVisibleInterval(
    () => {
      getProposals()
      getGauges()
    },
    REFRESH_INTERVAL['5m'],
    isPageVisible
  )

  return (
    <div suppressHydrationWarning>
      {typeof window === 'undefined' || !appLoaded ? null : (
        <HashRouter>
          <I18nProvider i18n={i18n}>
            <AriaI18nProvider locale={locale}>
              <OverlayProvider>
                <Page>
                  <Component />
                </Page>
                <GlobalStyle />
              </OverlayProvider>
            </AriaI18nProvider>
          </I18nProvider>
        </HashRouter>
      )}
    </div>
  )
}

export default CurveApp
