'use client'
import '@/global-extensions'
import delay from 'lodash/delay'
import { useParams, useRouter } from 'next/navigation'
import { type ReactNode, useCallback, useEffect, useState } from 'react'
import GlobalStyle from '@/globalStyle'
import Page from '@/loan/layout'
import networks from '@/loan/networks'
import { getPageWidthClassName } from '@/loan/store/createLayoutSlice'
import useStore from '@/loan/store/useStore'
import { type TempApi, useStablecoinConnection } from '@/loan/temp-lib'
import type { ChainId, UrlParams } from '@/loan/types/loan.types'
import { initLendApi, initStableJs } from '@/loan/utils/utilsCurvejs'
import { getPath, getRestFullPathname } from '@/loan/utils/utilsRouter'
import { ConnectionProvider, useWallet } from '@ui-kit/features/connect-wallet'
import { useUserProfileStore } from '@ui-kit/features/user-profile'
import usePageVisibleInterval from '@ui-kit/hooks/usePageVisibleInterval'
import { persister, queryClient, QueryProvider } from '@ui-kit/lib/api'
import { REFRESH_INTERVAL } from '@ui-kit/lib/model'
import { ThemeProvider } from '@ui-kit/shared/ui/ThemeProvider'
import { ChadCssProperties } from '@ui-kit/themes/fonts'
import { Chain } from '@ui-kit/utils'
import type { WalletState as Wallet } from '@web3-onboard/core/dist/types'

export const App = ({ children }: { children: ReactNode }) => {
  const { lib: curve = null } = useStablecoinConnection()
  const isPageVisible = useStore((state) => state.isPageVisible)
  const pageWidth = useStore((state) => state.layout.pageWidth)
  const fetchAllStoredUsdRates = useStore((state) => state.usdRates.fetchAllStoredUsdRates)
  const fetchGasInfo = useStore((state) => state.gas.fetchGasInfo)
  const setLayoutWidth = useStore((state) => state.layout.setLayoutWidth)
  const updateGlobalStoreByKey = useStore((state) => state.updateGlobalStoreByKey)
  const theme = useUserProfileStore((state) => state.theme)
  const hydrate = useStore((s) => s.hydrate)
  const { push } = useRouter()
  const params = useParams() as UrlParams

  const [appLoaded, setAppLoaded] = useState(false)

  const handleResizeListener = useCallback(() => {
    if (window.innerWidth) setLayoutWidth(getPageWidthClassName(window.innerWidth))
  }, [setLayoutWidth])

  useEffect(() => {
    if (!pageWidth) return
    document.body.className = `theme-${theme} ${pageWidth}`.replace(/ +(?= )/g, '').trim()
    document.body.setAttribute('data-theme', theme)
  }, [pageWidth, theme])

  // init app
  useEffect(() => {
    // reset the whole app state, as internal links leave the store with old state but curveJS is not loaded
    useStore.setState(useStore.getInitialState())

    const handleScrollListener = () => {
      updateGlobalStoreByKey('scrollY', window.scrollY)
    }

    useWallet.initialize(theme, networks)
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
        void fetchAllStoredUsdRates(curve)
        void fetchGasInfo(curve)
      }
    },
    REFRESH_INTERVAL['5m'],
    isPageVisible,
  )

  const initLib = useCallback(async (chainId: ChainId, wallet: Wallet | null): Promise<TempApi | undefined> => {
    if (!wallet) return
    const [stablecoin, lend] = await Promise.all([initStableJs(chainId, wallet), initLendApi(chainId, wallet)])
    return { stablecoin, lend, chainId }
  }, [])

  const onChainUnavailable = useCallback(
    ([walletChainId]: [ChainId, ChainId]) => {
      const network = networks[walletChainId]?.id
      if (network) {
        console.warn(`Network switched to ${network}, redirecting...`, location.href)
        push(getPath({ network }, `/${getRestFullPathname()}`))
      }
    },
    [push],
  )

  return (
    <div suppressHydrationWarning style={{ ...(theme === 'chad' && ChadCssProperties) }}>
      <GlobalStyle />
      <ThemeProvider theme={theme}>
        {appLoaded && (
          <QueryProvider persister={persister} queryClient={queryClient}>
            <ConnectionProvider<ChainId, TempApi>
              hydrate={hydrate}
              initLib={initLib}
              chainId={Chain.Ethereum}
              onChainUnavailable={onChainUnavailable}
            >
              <Page>{children}</Page>
            </ConnectionProvider>
          </QueryProvider>
        )}
      </ThemeProvider>
    </div>
  )
}
