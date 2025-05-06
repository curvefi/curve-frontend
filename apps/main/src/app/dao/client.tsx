'use client'
import '@/global-extensions'
import delay from 'lodash/delay'
import { useParams, useRouter } from 'next/navigation'
import { type ReactNode, useCallback, useEffect, useState } from 'react'
import { ClientWrapper } from '@/app/ClientWrapper'
import { BaseLayout } from '@/dao/layout'
import { helpers } from '@/dao/lib/curvejs'
import networks, { networksIdMapper } from '@/dao/networks'
import useStore from '@/dao/store/useStore'
import { ChainId, type UrlParams } from '@/dao/types/dao.types'
import { getPath, getRestFullPathname } from '@/dao/utils'
import { getPageWidthClassName } from '@ui/utils'
import { ConnectionProvider, useWallet } from '@ui-kit/features/connect-wallet'
import { useUserProfileStore } from '@ui-kit/features/user-profile'

export const App = ({ children }: { children: ReactNode }) => {
  const { network = 'ethereum' } = useParams() as Partial<UrlParams> // network absent only in root
  const pageWidth = useStore((state) => state.layout.pageWidth)
  const setPageWidth = useStore((state) => state.layout.setLayoutWidth)
  const updateShowScrollButton = useStore((state) => state.updateShowScrollButton)
  const updateGlobalStoreByKey = useStore((state) => state.updateGlobalStoreByKey)
  const theme = useUserProfileStore((state) => state.theme)
  const hydrate = useStore((s) => s.hydrate)

  const { push } = useRouter()

  const [appLoaded, setAppLoaded] = useState(false)

  const handleResizeListener = useCallback(() => {
    if (window.innerWidth) setPageWidth(getPageWidthClassName(window.innerWidth))
  }, [setPageWidth])

  useEffect(() => {
    if (!pageWidth) return
    document.body.className = `theme-${theme} ${pageWidth}`.replace(/ +(?= )/g, '').trim()
    document.body.setAttribute('data-theme', theme)
  }, [pageWidth, theme])

  useEffect(() => {
    // reset the whole app state, as internal links leave the store with old state but curveJS is not loaded
    useStore.setState(useStore.getInitialState())

    const handleScrollListener = () => {
      updateShowScrollButton(window.scrollY)
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

  const chainId = networksIdMapper[network]

  useEffect(() => {
    if (!networks[chainId]?.showInSelectNetwork) {
      console.warn(`Network ${network} not supported, redirecting...`, chainId)
      push(getPath({ network: 'ethereum' }, `/${getRestFullPathname()}`))
    }
  }, [network, chainId, push])

  return (
    <ClientWrapper loading={!appLoaded}>
      <ConnectionProvider
        hydrate={hydrate}
        initLib={helpers.initCurveJs}
        chainId={chainId}
        onChainUnavailable={onChainUnavailable}
      >
        <BaseLayout networkId={network} chainId={chainId}>
          {children}
        </BaseLayout>
      </ConnectionProvider>
    </ClientWrapper>
  )
}
