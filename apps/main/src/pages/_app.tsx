import type { AppProps } from 'next/app'

import '@/globals.css'
import { i18n } from '@lingui/core'
import { I18nProvider } from '@lingui/react'
import { OverlayProvider } from '@react-aria/overlays'
import 'focus-visible'
import 'intersection-observer'
import delay from 'lodash/delay'
import { useCallback, useEffect, useState } from 'react'
import { I18nProvider as AriaI18nProvider } from 'react-aria'
import { HashRouter } from 'react-router-dom'

import { REFRESH_INTERVAL } from '@/constants'
import usePageVisibleInterval from '@/hooks/usePageVisibleInterval'
import { dynamicActivate, initTranslation, updateAppLocale } from '@/lib/i18n'
import { messages as messagesEn } from '@/locales/en/messages.js'
import networks from '@/networks'
import useStore from '@/store/useStore'
import { getPageWidthClassName } from '@/ui/utils'
import { getStorageValue, isMobile, removeExtraSpaces } from '@/utils'
import { getLocaleFromUrl } from '@/utils/utilsRouter'
import { initOnboard } from 'onboard-helpers'
import zhHans from 'onboard-helpers/src/locales/zh-Hans'
import zhHant from 'onboard-helpers/src/locales/zh-Hant'

import GlobalStyle from '@/globalStyle'
import Page from '@/layout/default'
import { persister, queryClient } from '@/shared/curve-lib'
import { QueryProvider } from '@/ui/QueryProvider'

i18n.load({ en: messagesEn })
i18n.activate('en')

function CurveApp({ Component }: AppProps) {
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
  const updateWalletStoreByKey = useStore((state) => state.wallet.setStateByKey)

  const [appLoaded, setAppLoaded] = useState(false)

  const handleResizeListener = useCallback(() => {
    updateGlobalStoreByKey('isMobile', isMobile())
    if (window.innerWidth) setPageWidth(getPageWidthClassName(window.innerWidth))
  }, [setPageWidth, updateGlobalStoreByKey])

  const fetchPoolsVolumeTvl = useCallback(
    async (curve: CurveApi) => {
      const chainId = curve.chainId
      await Promise.all([fetchPoolsVolume(chainId, poolDatas), fetchPoolsTvl(curve, poolDatas)])
      setTokensMapper(chainId, poolDatas)
    },
    [fetchPoolsTvl, fetchPoolsVolume, poolDatas, setTokensMapper]
  )

  useEffect(() => {
    if (!pageWidth) return

    document.body.className = removeExtraSpaces(`theme-${themeType} ${pageWidth} ${isMobile() ? '' : 'scrollSmooth'}`)
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
      if (curve) {
        fetchGasInfo(curve)
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

  return (
    <div suppressHydrationWarning>
      {typeof window === 'undefined' || !appLoaded ? null : (
        <HashRouter>
          <I18nProvider i18n={i18n}>
            <AriaI18nProvider locale={locale}>
              <QueryProvider persister={persister} queryClient={queryClient}>
                <OverlayProvider>
                  <Page>
                    <Component />
                  </Page>
                  <GlobalStyle />
                </OverlayProvider>
              </QueryProvider>
            </AriaI18nProvider>
          </I18nProvider>
        </HashRouter>
      )}
    </div>
  )
}

export default CurveApp
