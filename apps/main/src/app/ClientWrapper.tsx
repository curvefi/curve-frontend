'use client'
import delay from 'lodash/delay'
import { usePathname, useRouter } from 'next/navigation'
import { ReactNode, useCallback, useEffect, useMemo } from 'react'
import { WagmiProvider } from 'wagmi'
import GlobalStyle from '@/globalStyle'
import { recordValues } from '@curvefi/prices-api/objects.util'
import { OverlayProvider } from '@react-aria/overlays'
import type { BaseConfig } from '@ui/utils'
import { ConnectionProvider } from '@ui-kit/features/connect-wallet'
import { createWagmiConfig } from '@ui-kit/features/connect-wallet/lib/wagmi/wagmi-config'
import { getPageWidthClassName, useLayoutStore } from '@ui-kit/features/layout'
import { useUserProfileStore } from '@ui-kit/features/user-profile'
import { persister, queryClient, QueryProvider } from '@ui-kit/lib/api'
import { getCurrentApp, getCurrentNetwork, replaceNetworkInPath } from '@ui-kit/shared/routes'
import { ThemeProvider } from '@ui-kit/shared/ui/ThemeProvider'
import { ChadCssProperties } from '@ui-kit/themes/fonts'

const useLayoutStoreResponsive = (window: Window) => {
  const { document } = window
  const theme = useUserProfileStore((state) => state.theme)
  const pageWidth = useLayoutStore((state) => state.pageWidth)
  const setLayoutWidth = useLayoutStore((state) => state.setLayoutWidth)
  const setPageVisible = useLayoutStore((state) => state.setPageVisible)
  const setScrollY = useLayoutStore((state) => state.setScrollY)

  const handleResizeListener = useCallback(() => {
    if (window.innerWidth) setLayoutWidth(getPageWidthClassName(window.innerWidth))
  }, [setLayoutWidth, window.innerWidth])

  useEffect(() => {
    if (!pageWidth) return
    document.body.className = `theme-${theme} ${pageWidth}`.replace(/ +(?= )/g, '').trim()
    document.body.setAttribute('data-theme', theme)
  }, [document.body, pageWidth, theme])

  // init app
  useEffect(() => {
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

function useNetworkFromUrl<ChainId extends number, NetworkConfig extends BaseConfig>(
  networks: Record<ChainId, NetworkConfig>,
) {
  const { push } = useRouter()
  const pathname = usePathname()
  const networkId = getCurrentNetwork(pathname)
  const network = useMemo(() => recordValues(networks).find((n) => n.id == networkId), [networkId, networks])
  useEffect(() => {
    if (!network && pathname) {
      console.warn(`Network unknown ${networkId}, redirecting to ethereum...`)
      push(replaceNetworkInPath(pathname, 'ethereum'))
    }
  }, [network, networkId, pathname, push])
  return network
}

export const ClientWrapper = <ChainId extends number, NetworkConfig extends BaseConfig>({
  children,
  networks,
}: {
  children: ReactNode
  networks: Record<ChainId, NetworkConfig>
}) => {
  const theme = useUserProfileStore((state) => state.theme)
  const config = useMemo(() => createWagmiConfig(networks), [networks])
  const pathname = usePathname()
  const { push } = useRouter()
  useLayoutStoreResponsive(window)

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

  return (
    network && (
      <div suppressHydrationWarning style={{ ...(theme === 'chad' && ChadCssProperties) }}>
        <GlobalStyle />
        <ThemeProvider theme={theme}>
          <OverlayProvider>
            <QueryProvider persister={persister} queryClient={queryClient}>
              <WagmiProvider config={config}>
                {network && (
                  <ConnectionProvider
                    app={getCurrentApp(pathname)}
                    network={network}
                    onChainUnavailable={onChainUnavailable}
                  >
                    {children}
                  </ConnectionProvider>
                )}
              </WagmiProvider>
            </QueryProvider>
          </OverlayProvider>
        </ThemeProvider>
      </div>
    )
  )
}
