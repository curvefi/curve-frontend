'use client'
import '@/global-extensions'
import delay from 'lodash/delay'
import { useRouter } from 'next/navigation'
import { type ReactNode, useCallback, useEffect, useState } from 'react'
import Page from '@/dex/layout/default'
import curvejsApi from '@/dex/lib/curvejs'
import useStore from '@/dex/store/useStore'
import { ChainId, CurveApi } from '@/dex/types/main.types'
import { initCurveJs } from '@/dex/utils/utilsCurvejs'
import { getPath, useNetworkFromUrl, useRestFullPathname } from '@/dex/utils/utilsRouter'
import GlobalStyle from '@/globalStyle'
import { OverlayProvider } from '@react-aria/overlays'
import { ConnectionProvider, useConnection, useWallet } from '@ui-kit/features/connect-wallet'
import { useUserProfileStore } from '@ui-kit/features/user-profile'
import usePageVisibleInterval from '@ui-kit/hooks/usePageVisibleInterval'
import { persister, queryClient, QueryProvider } from '@ui-kit/lib/api'
import { REFRESH_INTERVAL } from '@ui-kit/lib/model'
import { ThemeProvider } from '@ui-kit/shared/ui/ThemeProvider'
import { ChadCssProperties } from '@ui-kit/themes/fonts'

export const App = ({ children }: { children: ReactNode }) => {
  const { lib: curve } = useConnection<CurveApi>()
  const chainId = curve?.chainId ?? 1
  const hydrate = useStore((state) => state.hydrate)
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
  const networks = useStore((state) => state.networks.networks)
  const network = networks[chainId]
  const theme = useUserProfileStore((state) => state.theme)

  const { rChainId } = useNetworkFromUrl()
  const restFullPathname = useRestFullPathname()
  const { push } = useRouter()

  const [appLoaded, setAppLoaded] = useState(false)

  const handleResizeListener = useCallback(() => {
    if (window.innerWidth) setPageWidth(window.innerWidth)
  }, [setPageWidth])

  const fetchPoolsVolumeTvl = useCallback(
    async (curve: CurveApi) => {
      const { chainId } = curve
      const poolDatas = Object.values(poolDataMapper)
      await Promise.all([fetchPoolsVolume(chainId, poolDatas), fetchPoolsTvl(curve, poolDatas)])
      void setTokensMapper(chainId, poolDatas)
    },
    [fetchPoolsTvl, fetchPoolsVolume, poolDataMapper, setTokensMapper],
  )

  useEffect(() => {
    if (!pageWidth) return
    document.body.className = `theme-${theme} ${pageWidth}`.replace(/ +(?= )/g, '').trim()
    document.body.setAttribute('data-theme', theme)
  }, [pageWidth, theme])

  useEffect(() => {
    // reset the whole app state, as internal links leave the store with old state but curveJS is not loaded
    useStore.setState(useStore.getInitialState())
    void (async () => {
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
      void fetchPools(curve, poolIds, null)
    },
    [fetchPools, network],
  )

  usePageVisibleInterval(
    () => {
      if (curve) {
        void fetchGasInfo(curve)
        void fetchAllStoredUsdRates(curve)
        void fetchPoolsVolumeTvl(curve)

        if (curve.signerAddress) {
          void fetchAllStoredBalances(curve)
        }
      }
    },
    REFRESH_INTERVAL['5m'],
    isPageVisible,
  )

  usePageVisibleInterval(
    () => {
      if (curve) {
        void refetchPools(curve)
      }
    },
    REFRESH_INTERVAL['11m'],
    isPageVisible,
  )

  const onChainUnavailable = useCallback(
    ([walletChainId]: [ChainId, ChainId]) => {
      const network = networks[walletChainId]?.id
      if (network) {
        console.warn(`Network switched to ${network}, redirecting...`, location.href)
        push(getPath({ network }, `/${restFullPathname}`))
      }
    },
    [networks, push, restFullPathname],
  )

  return (
    <div suppressHydrationWarning style={{ ...(theme === 'chad' && ChadCssProperties) }}>
      <GlobalStyle />
      <ThemeProvider theme={theme}>
        {appLoaded && (
          <OverlayProvider>
            <QueryProvider persister={persister} queryClient={queryClient}>
              <ConnectionProvider
                hydrate={hydrate}
                initLib={initCurveJs}
                chainId={rChainId}
                onChainUnavailable={onChainUnavailable}
              >
                <Page>{children}</Page>
              </ConnectionProvider>
            </QueryProvider>
          </OverlayProvider>
        )}
      </ThemeProvider>
    </div>
  )
}
