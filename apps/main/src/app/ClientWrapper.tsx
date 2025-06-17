'use client'
import delay from 'lodash/delay'
import { usePathname, useRouter } from 'next/navigation'
import { ReactNode, useCallback, useEffect, useMemo } from 'react'
import { WagmiProvider } from 'wagmi'
import { AppContainer } from '@/app/AppContainer'
import GlobalStyle from '@/globalStyle'
import { recordValues } from '@curvefi/prices-api/objects.util'
import { OverlayProvider } from '@react-aria/overlays'
import type { NetworkDef } from '@ui/utils'
import { ConnectionProvider } from '@ui-kit/features/connect-wallet'
import { createWagmiConfig } from '@ui-kit/features/connect-wallet/lib/wagmi/wagmi-config'
import { getPageWidthClassName, useLayoutStore } from '@ui-kit/features/layout'
import { useUserProfileStore } from '@ui-kit/features/user-profile'
import { persister, queryClient, QueryProvider } from '@ui-kit/lib/api'
import { getHashRedirectUrl } from '@ui-kit/shared/route-redirects'
import { getCurrentApp, getCurrentNetwork, replaceNetworkInPath } from '@ui-kit/shared/routes'
import { ThemeProvider } from '@ui-kit/shared/ui/ThemeProvider'
import { ChadCssProperties } from '@ui-kit/themes/fonts'

const useLayoutStoreResponsive = (window?: Window) => {
  const { document } = typeof window === 'undefined' ? {} : window
  const theme = useUserProfileStore((state) => state.theme)
  const pageWidth = useLayoutStore((state) => state.pageWidth)
  const setLayoutWidth = useLayoutStore((state) => state.setLayoutWidth)
  const setPageVisible = useLayoutStore((state) => state.setPageVisible)
  const setScrollY = useLayoutStore((state) => state.setScrollY)

  const handleResizeListener = useCallback(() => {
    if (window?.innerWidth) setLayoutWidth(getPageWidthClassName(window.innerWidth))
  }, [setLayoutWidth, window?.innerWidth])

  useEffect(() => {
    if (!pageWidth || !document) return
    document.body.className = `theme-${theme} ${pageWidth}`.replace(/ +(?= )/g, '').trim()
    document.body.setAttribute('data-theme', theme)
  }, [document, pageWidth, theme])

  // init app
  useEffect(() => {
    if (!window || !document) return
    const handleScrollListener = () => setScrollY(window.scrollY)
    const handleVisibilityChange = () => setPageVisible(!document.hidden)

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
  }, [document, handleResizeListener, setPageVisible, setScrollY, window])
}

function useNetworkFromUrl<ChainId extends number, NetworkConfig extends NetworkDef>(
  networks: Record<ChainId, NetworkConfig>,
) {
  const { replace } = useRouter()
  const pathname = usePathname()
  const networkId = getCurrentNetwork(pathname)
  const network = useMemo(() => recordValues(networks).find((n) => n.id == networkId), [networkId, networks])
  useEffect(() => {
    if (network || !pathname) {
      return
    }
    const redirectUrl = networkId ? replaceNetworkInPath(pathname, 'ethereum') : getHashRedirectUrl(window.location)
    console.warn(`Network unknown in ${window.location.href}, redirecting to ${redirectUrl}...`)
    replace(redirectUrl)
  }, [network, networkId, pathname, replace])
  return network
}

export const ClientWrapper = <TId extends string, ChainId extends number>({
  children,
  networks,
}: {
  children: ReactNode
  networks: Record<ChainId, NetworkDef<TId, ChainId>>
}) => {
  const theme = useUserProfileStore((state) => state.theme)
  const config = useMemo(() => createWagmiConfig(networks), [networks])
  const pathname = usePathname()
  const { push } = useRouter()
  useLayoutStoreResponsive()

  const onChainUnavailable = useCallback(
    ([walletChainId]: [ChainId, ChainId]) => {
      const network = networks[walletChainId]?.id
      if (pathname && network) {
        console.warn(`Network switched to ${network}, redirecting...`, location.href)
        push(replaceNetworkInPath(pathname, network))
      }
    },
    [networks, pathname, push],
  )
  const network = useNetworkFromUrl(networks)

  const currentApp = getCurrentApp(pathname)
  return (
    network && (
      <div suppressHydrationWarning style={{ ...(theme === 'chad' && ChadCssProperties) }}>
        <GlobalStyle />
        <ThemeProvider theme={theme}>
          <OverlayProvider>
            <QueryProvider persister={persister} queryClient={queryClient}>
              <WagmiProvider config={config}>
                <ConnectionProvider app={currentApp} network={network} onChainUnavailable={onChainUnavailable}>
                  <AppContainer currentApp={currentApp} network={network} networks={networks}>
                    {children}
                  </AppContainer>
                </ConnectionProvider>
              </WagmiProvider>
            </QueryProvider>
          </OverlayProvider>
        </ThemeProvider>
      </div>
    )
  )
}
