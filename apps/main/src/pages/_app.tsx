import type { AppProps } from 'next/app'
import type { Locale } from '@/lib/i18n'
import type { Theme } from '@/store/createGlobalSlice'

import { useCallback, useEffect } from 'react'
import { HashRouter } from 'react-router-dom'
import { i18n } from '@lingui/core'
import { I18nProvider } from '@lingui/react'
import { I18nProvider as AriaI18nProvider } from 'react-aria'
import { OverlayProvider } from '@react-aria/overlays'
import delay from 'lodash/delay'
import dynamic from 'next/dynamic'
import 'intersection-observer'
import 'focus-visible'
import '@/globals.css'

import { curveProps } from '@/lib/utils'
import { dynamicActivate, initTranslation, parseLocale, updateAppLocale } from '@/lib/i18n'
import { isMobile, getStorageValue, removeExtraSpaces } from '@/utils'
import { REFRESH_INTERVAL } from '@/constants'
import { initOnboard } from 'onboard-helpers'
import { messages as messagesEn } from '@/locales/en/messages.js'
import networks from '@/networks'
import usePageVisibleInterval from '@/hooks/usePageVisibleInterval'
import useStore from '@/store/useStore'
import zhHans from 'onboard-helpers/src/locales/zh-Hans'
import zhHant from 'onboard-helpers/src/locales/zh-Hant'

import Page from '@/layout/default'
import GlobalStyle from '@/globalStyle'

const NetworkProvider = dynamic(() => import('@/components/NetworkProvider'), { ssr: false })

i18n.load({ en: messagesEn })
i18n.activate('en')

function CurveApp({ Component, pageProps }: AppProps) {
  const curve = useStore((state) => state.curve)
  const chainId = curve?.chainId ?? ''
  const isPageVisible = useStore((state) => state.isPageVisible)
  const locale = useStore((state) => state.locale)
  const pageWidth = useStore((state) => state.pageWidth)
  const poolDatas = useStore((state) => state.pools.pools[chainId])
  const themeType = useStore((state) => state.themeType)
  const setPageWidth = useStore((state) => state.setPageWidth)
  const fetchPools = useStore((state) => state.pools.fetchPools)
  const fetchPoolsVolume = useStore((state) => state.pools.fetchPoolsVolume)
  const fetchPoolsTvl = useStore((state) => state.pools.fetchPoolsTvl)
  const fetchGasInfo = useStore((state) => state.gas.fetchGasInfo)
  const fetchAllStoredUsdRates = useStore((state) => state.usdRates.fetchAllStoredUsdRates)
  const fetchAllStoredBalances = useStore((state) => state.userBalances.fetchAllStoredBalances)
  const setTokensMapper = useStore((state) => state.tokens.setTokensMapper)
  const updateShowScrollButton = useStore((state) => state.updateShowScrollButton)
  const updateGlobalStoreByKey = useStore((state) => state.updateGlobalStoreByKey)
  const updateWalletStoreByKey = useStore((state) => state.wallet.updateWalletStoreByKey)

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
        setPageWidth(updatedPageWidthClassName as PageWidthClassName)
      }
    }
  }, [setPageWidth, updateGlobalStoreByKey])

  const fetchPoolsVolumeTvl = useCallback(
    async (curve: CurveApi) => {
      const chainId = curve.chainId
      await Promise.all([fetchPoolsVolume(chainId, poolDatas), fetchPoolsTvl(curve, poolDatas)])
      setTokensMapper(chainId, poolDatas)
    },
    [fetchPoolsTvl, fetchPoolsVolume, poolDatas, setTokensMapper]
  )

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
      updateWalletStoreByKey('onboard', onboardInstance)
    },
    [updateWalletStoreByKey]
  )

  useEffect(() => {
    if (!pageWidth) return

    document.body.className = removeExtraSpaces(`theme-${themeType} ${pageWidth} ${isMobile() ? '' : 'scrollSmooth'}`)
    document.documentElement.lang = locale
  })

  useEffect(() => {
    const handleScrollListener = () => {
      updateShowScrollButton(window.scrollY)
    }

    const { locale, themeType } = getStorageValue('APP_CACHE') ?? {}

    // init theme
    const darkModeQuery = window.matchMedia('(prefers-color-scheme: dark)')
    updateGlobalStoreByKey('themeType', themeType ? themeType : darkModeQuery.matches ? 'dark' : 'default')

    // init locale
    const { parsedLocale } = parseLocale(locale)
    initTranslation(i18n, parsedLocale)
    dynamicActivate(parsedLocale)
    updateAppLocale(parsedLocale, updateGlobalStoreByKey)

    // init onboard
    initOnboardApi(parsedLocale, themeType)

    const handleVisibilityChange = () => {
      updateGlobalStoreByKey('isPageVisible', !document.hidden)
    }

    handleResizeListener()
    updateGlobalStoreByKey('loaded', true)
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

  const refetchPools = useCallback(
    async (curve: CurveApi) => {
      const chainId = curve.chainId
      const poolIds = await networks[chainId].api.network.fetchAllPoolsList(curve)
      fetchPools(curve, poolIds, null)
    },
    [fetchPools]
  )

  usePageVisibleInterval(
    () => {
      fetchGasInfo(curve)

      if (curve) {
        fetchAllStoredUsdRates(curve)
        fetchPoolsVolumeTvl(curve)

        if (curve.signerAddress) {
          fetchAllStoredBalances(curve)
        }
      }
    },
    REFRESH_INTERVAL['5m'],
    isPageVisible
  )

  usePageVisibleInterval(
    () => {
      if (curve) {
        refetchPools(curve)
      }
    },
    REFRESH_INTERVAL['11m'],
    isPageVisible
  )

  const props = {
    ...pageProps,
    curve,
    ...curveProps(curve),
  }

  return (
    <div suppressHydrationWarning>
      {typeof window === 'undefined' ? null : (
        <HashRouter>
          <NetworkProvider>
            <I18nProvider i18n={i18n}>
              <AriaI18nProvider locale={locale}>
                <OverlayProvider>
                  <Page {...props}>
                    <Component {...props} />
                  </Page>
                  <GlobalStyle />
                </OverlayProvider>
              </AriaI18nProvider>
            </I18nProvider>
          </NetworkProvider>
        </HashRouter>
      )}
    </div>
  )
}

export default CurveApp
