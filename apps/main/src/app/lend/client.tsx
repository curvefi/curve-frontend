'use client'
import '@/global-extensions'
import delay from 'lodash/delay'
import { useParams, useRouter } from 'next/navigation'
import { type ReactNode, useCallback, useEffect, useState } from 'react'
import Page from '@/lend/layout'
import { helpers } from '@/lend/lib/apiLending'
import networks, { networksIdMapper } from '@/lend/networks'
import { getPageWidthClassName } from '@/lend/store/createLayoutSlice'
import useStore from '@/lend/store/useStore'
import type { ChainId, UrlParams } from '@/lend/types/lend.types'
import { getPath, getRestFullPathname } from '@/lend/utils/utilsRouter'
import { ConnectionProvider, useWallet } from '@ui-kit/features/connect-wallet'
import { useUserProfileStore } from '@ui-kit/features/user-profile'
import { ClientWrapper } from '../ClientWrapper'

export const App = ({ children }: { children: ReactNode }) => {
  const { network: networkName } = useParams() as UrlParams // todo: move layout to [network] and pass the params properly
  const chainId = networksIdMapper[networkName]
  const pageWidth = useStore((state) => state.layout.pageWidth)
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

    // init onboard
    useWallet.initialize(theme, networks)

    const handleVisibilityChange = () => {
      updateGlobalStoreByKey('isPageVisible', !document.hidden)
    }

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

  const onChainUnavailable = useCallback(
    ([walletChainId]: [ChainId, ChainId]) => {
      const foundNetwork = networks[walletChainId]?.id
      if (foundNetwork) {
        console.warn(`Network switched to ${foundNetwork}, redirecting...`, location.href)
        push(getPath({ network: foundNetwork }, `/${getRestFullPathname()}`))
      }
    },
    [push],
  )

  return (
    <ClientWrapper loading={!appLoaded}>
      {appLoaded && (
        <ConnectionProvider
          hydrate={hydrate}
          initLib={helpers.initApi}
          chainId={chainId}
          onChainUnavailable={onChainUnavailable}
        >
          <Page>{children}</Page>
        </ConnectionProvider>
      )}
    </ClientWrapper>
  )
}
