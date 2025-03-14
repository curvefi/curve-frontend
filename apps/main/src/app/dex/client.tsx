'use client'
import '@/global-extensions'
import delay from 'lodash/delay'
import { type ReactNode, useCallback, useEffect, useState } from 'react'
import Page from '@/dex/layout/default'
import curvejsApi from '@/dex/lib/curvejs'
import useStore from '@/dex/store/useStore'
import { CurveApi, type PageWidthClassName } from '@/dex/types/main.types'
import GlobalStyle from '@/globalStyle'
import useMediaQuery from '@mui/material/useMediaQuery'
import { OverlayProvider } from '@react-aria/overlays'
import { useWallet } from '@ui-kit/features/connect-wallet'
import { useUserProfileStore } from '@ui-kit/features/user-profile'
import usePageVisibleInterval from '@ui-kit/hooks/usePageVisibleInterval'
import { persister, queryClient, QueryProvider } from '@ui-kit/lib/api'
import { REFRESH_INTERVAL } from '@ui-kit/lib/model'
import { ThemeProvider } from '@ui-kit/shared/ui/ThemeProvider'
import { ChadCssProperties } from '@ui-kit/themes/typography'

export const App = ({ children }: { children: ReactNode }) => {
  const curve = useStore((state) => state.curve)
  const chainId = curve?.chainId ?? ''
  const isPageVisible = useStore((state) => state.isPageVisible)
  const pageWidth = useStore((state) => state.pageWidth)
  const poolDataMapper = useStore((state) => state.pools.poolsMapper[chainId])
  const setPageWidth = useStore((state) => state.setPageWidth)
  const fetchNetworks = useStore((state) => state.networks.fetchNetworks)
  const fetchPools = useStore((state) => state.pools.fetchPools)
  const fetchPoolsVolume = useStore((state) => state.pools.fetchPoolsVolume)
  const fetchPoolsTvl = useStore((state) => state.pools.fetchPoolsTvl)
  const fetchGasInfo = useStore((state) => state.gas.fetchGasInfo)
  const fetchAllStoredUsdRates = useStore((state) => state.usdRates.fetchAllStoredUsdRates)
  const fetchAllStoredBalances = useStore((state) => state.userBalances.fetchAllStoredBalances)
  const setTokensMapper = useStore((state) => state.tokens.setTokensMapper)
  const updateShowScrollButton = useStore((state) => state.updateShowScrollButton)
  const updateGlobalStoreByKey = useStore((state) => state.updateGlobalStoreByKey)
  const network = useStore((state) => state.networks.networks[chainId])
  const theme = useUserProfileStore((state) => state.theme)

  const [appLoaded, setAppLoaded] = useState(false)

  const handleResizeListener = useCallback(() => {
    if (window.innerWidth) setPageWidth(window.innerWidth)
  }, [setPageWidth])

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
    ;(async () => {
      const networks = await fetchNetworks()

      useWallet.initialize(theme, networks)

      const handleVisibilityChange = () => {
        updateGlobalStoreByKey('isPageVisible', !document.hidden)
      }

      setAppLoaded(true)
      updateGlobalStoreByKey('loaded', true)
      handleResizeListener()
      handleVisibilityChange()

      document.addEventListener('visibilitychange', handleVisibilityChange)
      window.addEventListener('resize', () => handleResizeListener())
      window.addEventListener('scroll', () => delay(() => updateShowScrollButton(window.scrollY), 200))
    })()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

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
    <div suppressHydrationWarning style={{ ...(theme === 'chad' && ChadCssProperties) }}>
      <GlobalStyle />
      <ThemeProvider theme={theme}>
        <BodyClassHandler pageWidth={pageWidth} theme={theme} />
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

const BodyClassHandler = ({ pageWidth, theme }: { pageWidth: PageWidthClassName | null; theme: string }) => {
  const isMobile = useMediaQuery((t) => t.breakpoints.down('tablet'))

  useEffect(() => {
    if (!pageWidth) return
    document.body.className = `theme-${theme} ${pageWidth} ${isMobile ? '' : 'scrollSmooth'}`
      .replace(/ +(?= )/g, '')
      .trim()

    document.body.setAttribute('data-theme', theme)
  }, [isMobile, pageWidth, theme])

  return null
}
