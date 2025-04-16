'use client'
import type { Eip1193Provider } from 'ethers'
import '@/global-extensions'
import delay from 'lodash/delay'
import { useParams, useRouter } from 'next/navigation'
import { type ReactNode, useCallback, useEffect, useState } from 'react'
import { ClientWrapper } from '@/app/ClientWrapper'
import Page from '@/loan/layout'
import { networks, networksIdMapper } from '@/loan/networks'
import { getPageWidthClassName } from '@/loan/store/createLayoutSlice'
import useStore from '@/loan/store/useStore'
import { type TempApi, useStablecoinConnection } from '@/loan/temp-lib'
import type { ChainId, UrlParams } from '@/loan/types/loan.types'
import { initLendApi, initStableJs } from '@/loan/utils/utilsCurvejs'
import { getPath, getRestFullPathname } from '@/loan/utils/utilsRouter'
import { ConnectionProvider } from '@ui-kit/features/connect-wallet'
import { useUserProfileStore } from '@ui-kit/features/user-profile'
import usePageVisibleInterval from '@ui-kit/hooks/usePageVisibleInterval'
import { REFRESH_INTERVAL } from '@ui-kit/lib/model'

export const App = ({ children }: { children: ReactNode }) => {
  const { network: networkId = 'ethereum' } = useParams() as Partial<UrlParams> // network absent only in root
  const chainId = networksIdMapper[networkId]
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

  const initLib = useCallback(async (chainId: ChainId, provider?: Eip1193Provider): Promise<TempApi | undefined> => {
    if (!provider) return
    const [stablecoin, lend] = await Promise.all([initStableJs(chainId, provider), initLendApi(chainId, provider)])
    return { stablecoin, lend, chainId, signerAddress: stablecoin.signerAddress ?? lend.signerAddress }
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

  useEffect(() => {
    if (!networks[chainId]?.showInSelectNetwork) {
      console.warn(`Network not supported ${networkId}, redirecting...`, chainId)
      push(getPath({ network: 'ethereum' }, `/${getRestFullPathname()}`))
    }
  }, [networkId, chainId, push])

  return (
    <ClientWrapper loading={!appLoaded}>
      <ConnectionProvider<ChainId, TempApi>
        hydrate={hydrate}
        initLib={initLib}
        chainId={chainId}
        onChainUnavailable={onChainUnavailable}
      >
        <Page>{children}</Page>
      </ConnectionProvider>
    </ClientWrapper>
  )
}
