import '@/globals.css'
import 'focus-visible'
import 'intersection-observer'
import { i18n } from '@lingui/core'
import { I18nProvider } from '@lingui/react'
import { OverlayProvider } from '@react-aria/overlays'
import { useCallback, useEffect, useState } from 'react'
import { I18nProvider as AriaI18nProvider } from 'react-aria'
import { HashRouter } from 'react-router-dom'
import type { AppProps } from 'next/app'
import { persister, queryClient } from '@/shared/api/query-client'
import { ThemeProvider } from 'curve-ui-kit/src/shared/ui/ThemeProvider'
import { REFRESH_INTERVAL } from '@/constants'
import GlobalStyle from '@/globalStyle'
import usePageVisibleInterval from '@/hooks/usePageVisibleInterval'
import { messages as messagesEn } from '@/locales/en/messages.js'
import curvejsApi from '@/lib/curvejs'
import useStore from '@/store/useStore'
import { QueryProvider } from '@/ui/QueryProvider'
import { isMobile, removeExtraSpaces } from '@/utils'

i18n.load({ en: messagesEn })
i18n.activate('en')

function CurveApp(props: AppProps) {
  console.log('_app', {window: typeof window, props: JSON.stringify(props) })
  const { Component, pageProps } = props
  const curve = useStore((state) => state.curve)
  const chainId = curve?.chainId ?? ''
  const isPageVisible = useStore((state) => state.isPageVisible)
  const locale = useStore((state) => state.locale)
  const pageWidth = useStore((state) => state.pageWidth)
  const poolDataMapper = useStore((state) => state.pools.poolsMapper[chainId])
  const themeType = useStore((state) => state.themeType)
  const fetchPools = useStore((state) => state.pools.fetchPools)
  const fetchPoolsVolume = useStore((state) => state.pools.fetchPoolsVolume)
  const fetchPoolsTvl = useStore((state) => state.pools.fetchPoolsTvl)
  const fetchGasInfo = useStore((state) => state.gas.fetchGasInfo)
  const fetchAllStoredUsdRates = useStore((state) => state.usdRates.fetchAllStoredUsdRates)
  const fetchAllStoredBalances = useStore((state) => state.userBalances.fetchAllStoredBalances)
  const setTokensMapper = useStore((state) => state.tokens.setTokensMapper)
  const network = useStore((state) => state.networks.networks[chainId])
  const [appLoaded, setAppLoaded] = useState(false)

  const fetchPoolsVolumeTvl = useCallback(
    async (curve: CurveApi) => {
      const { chainId } = curve
      const poolDatas = Object.values(poolDataMapper)
      await Promise.all([fetchPoolsVolume(chainId, poolDatas), fetchPoolsTvl(curve, poolDatas)])
      setTokensMapper(chainId, poolDatas)
    },
    [fetchPoolsTvl, fetchPoolsVolume, poolDataMapper, setTokensMapper],
  )

  useEffect(() => {
    setAppLoaded(true)
    if (!pageWidth) return

    document.body.className = removeExtraSpaces(`theme-${themeType} ${pageWidth} ${isMobile() ? '' : 'scrollSmooth'}`)
    document.body.setAttribute('data-theme', themeType || '')
    document.documentElement.lang = locale
  }, [locale, pageWidth, themeType])

  const refetchPools = useCallback(
    async (curve: CurveApi) => {
      const poolIds = await curvejsApi.network.fetchAllPoolsList(curve, network)
      fetchPools(curve, poolIds, null)
    },
    [fetchPools, network],
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
    isPageVisible,
  )

  usePageVisibleInterval(
    () => {
      if (curve) {
        refetchPools(curve)
      }
    },
    REFRESH_INTERVAL['11m'],
    isPageVisible,
  )

  return (
    <div suppressHydrationWarning>
      <ThemeProvider theme={themeType === 'default' ? 'light' : themeType}>
        {typeof window !== 'undefined' && appLoaded && (
          <HashRouter>
            <I18nProvider i18n={i18n}>
              <AriaI18nProvider locale={locale}>
                <QueryProvider persister={persister} queryClient={queryClient}>
                  <OverlayProvider>
                      <Component {...pageProps} />
                    <GlobalStyle />
                  </OverlayProvider>
                </QueryProvider>
              </AriaI18nProvider>
            </I18nProvider>
          </HashRouter>
        )}
      </ThemeProvider>
    </div>
  )
}
