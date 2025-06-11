'use client'
import '@/global-extensions'
import delay from 'lodash/delay'
import { useParams, useRouter } from 'next/navigation'
import { type ReactNode, useCallback, useEffect, useState } from 'react'
import { ClientWrapper } from '@/app/ClientWrapper'
import Page from '@/dex/layout/default'
import useStore from '@/dex/store/useStore'
import { type ChainId, type UrlParams } from '@/dex/types/main.types'
import { initCurveJs } from '@/dex/utils/utilsCurvejs'
import { getPath, useRestFullPathname } from '@/dex/utils/utilsRouter'
import { ConnectionProvider } from '@ui-kit/features/connect-wallet'
import { useLayoutStore } from '@ui-kit/features/layout'
import { useUserProfileStore } from '@ui-kit/features/user-profile'

export const App = ({ children }: { children: ReactNode }) => {
  const { network: networkId = 'ethereum' } = useParams() as Partial<UrlParams> // network absent only in root
  const { push } = useRouter()
  const restFullPathname = useRestFullPathname()
  const [appLoaded, setAppLoaded] = useState(false)

  const pageWidth = useLayoutStore((state) => state.pageWidth)
  const setPageWidth = useLayoutStore((state) => state.setPageWidth)
  const setPageVisible = useLayoutStore((state) => state.setPageVisible)
  const updateShowScrollButton = useLayoutStore((state) => state.updateShowScrollButton)
  const fetchNetworks = useStore((state) => state.networks.fetchNetworks)
  const networks = useStore((state) => state.networks.networks)
  const networksIdMapper = useStore((state) => state.networks.networksIdMapper)
  const theme = useUserProfileStore((state) => state.theme)
  const hydrate = useStore((s) => s.hydrate)

  const chainId = networksIdMapper[networkId]
  const network = networks[chainId]

  const handleResizeListener = useCallback(() => {
    if (window.innerWidth) setPageWidth(window.innerWidth)
  }, [setPageWidth])

  useEffect(() => {
    if (!pageWidth) return
    document.body.className = `theme-${theme} ${pageWidth}`.replace(/ +(?= )/g, '').trim()
    document.body.setAttribute('data-theme', theme)
  }, [pageWidth, theme])

  useEffect(() => {
    // reset the whole app state, as internal links leave the store with old state but curveJS is not loaded
    useStore.setState(useStore.getInitialState())
    void (async () => {
      await fetchNetworks()
      setAppLoaded(true)
    })()

    const handleVisibilityChange = () => setPageVisible(!document.hidden)
    const handleScroll = () => delay(() => updateShowScrollButton(window.scrollY), 200)
    handleResizeListener()
    handleVisibilityChange()

    document.addEventListener('visibilitychange', handleVisibilityChange)
    window.addEventListener('resize', handleResizeListener)
    window.addEventListener('scroll', handleScroll)

    return () => {
      setAppLoaded(false)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      window.removeEventListener('resize', handleResizeListener)
      window.removeEventListener('scroll', handleScroll)
    }

  }, [fetchNetworks, handleResizeListener, setPageVisible, updateShowScrollButton])

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
    <ClientWrapper loading={!appLoaded}>
      <ConnectionProvider
        hydrate={hydrate}
        initLib={initCurveJs}
        chainId={chainId}
        onChainUnavailable={onChainUnavailable}
      >
        <Page network={network}>{children}</Page>
      </ConnectionProvider>
    </ClientWrapper>
  )
}
