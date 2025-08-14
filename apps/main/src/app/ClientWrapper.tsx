'use client'
import lodash from 'lodash'
import { ReactNode, useCallback, useEffect, useMemo, useState } from 'react'
import type { Chain } from 'viem'
import { WagmiProvider } from 'wagmi'
import { GlobalLayout } from '@/app/GlobalLayout'
import { StyledComponentsRegistry } from '@/app/StyledComponentsRegistry'
import { recordValues } from '@curvefi/prices-api/objects.util'
import { OverlayProvider } from '@react-aria/overlays'
import type { NetworkDef } from '@ui/utils'
import {
  ConnectionProvider,
  createChainFromNetwork,
  createTransportFromNetwork,
  createWagmiConfig,
  defaultGetRpcUrls,
} from '@ui-kit/features/connect-wallet'
import { getPageWidthClassName, useLayoutStore } from '@ui-kit/features/layout'
import { useUserProfileStore } from '@ui-kit/features/user-profile'
import { useNavigate, usePathname } from '@ui-kit/hooks/router'
import { persister, queryClient, QueryProvider } from '@ui-kit/lib/api'
import { getHashRedirectUrl } from '@ui-kit/shared/route-redirects'
import { getCurrentApp, getCurrentNetwork, replaceNetworkInPath } from '@ui-kit/shared/routes'
import { ThemeProvider } from '@ui-kit/shared/ui/ThemeProvider'
import { ThemeKey } from '@ui-kit/themes/basic-theme'

const { delay } = lodash

const useLayoutStoreResponsive = () => {
  const { document } = typeof window === 'undefined' ? {} : window
  const theme = useUserProfileStore((state) => state.theme)
  const pageWidth = useLayoutStore((state) => state.pageWidth)
  const setLayoutWidth = useLayoutStore((state) => state.setLayoutWidth)
  const setPageVisible = useLayoutStore((state) => state.setPageVisible)
  const updateShowScrollButton = useLayoutStore((state) => state.updateShowScrollButton)

  const handleResizeListener = useCallback(() => {
    if (window?.innerWidth) setLayoutWidth(getPageWidthClassName(window.innerWidth))
  }, [setLayoutWidth])

  useEffect(() => {
    if (!pageWidth || !document) return
    document.body.className = `theme-${theme} ${pageWidth}`.replace(/ +(?= )/g, '').trim()
    document.body.setAttribute('data-theme', theme)
  }, [document, pageWidth, theme])

  useEffect(() => {
    if (!window || !document) return
    const handleScrollListener = () => updateShowScrollButton(window.scrollY)
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
  }, [document, handleResizeListener, setPageVisible, updateShowScrollButton])
}

function useNetworkFromUrl(networks: NetworkDef[]) {
  const navigate = useNavigate()
  const pathname = usePathname()
  const networkId = getCurrentNetwork(pathname)
  const network = useMemo(() => networks.find((n) => n.id == networkId), [networkId, networks])
  useEffect(() => {
    if (network || !pathname) {
      return
    }
    const redirectUrl = networkId ? replaceNetworkInPath(pathname, 'ethereum') : getHashRedirectUrl(window.location)
    console.warn(`Network unknown in ${window.location.href}, redirecting to ${redirectUrl}...`)
    navigate(redirectUrl, { replace: true })
  }, [network, networkId, pathname, navigate])
  return network
}

/**
 * During SSR, we cannot access the user's theme preference, so that can lead to hydration mismatch.
 */
function useThemeAfterSsr(preferredScheme: 'light' | 'dark' | null) {
  const [theme, setTheme] = useState<ThemeKey>(preferredScheme ?? 'light')
  const storeTheme = useUserProfileStore((state) => state.theme)
  useEffect(() => {
    setTheme(storeTheme)
  }, [setTheme, storeTheme])
  return theme
}

/**
 * TODO: Rename this to RootLayout
 */
export const ClientWrapper = <TId extends string, ChainId extends number>({
  children,
  networkDefs,
  preferredScheme,
}: {
  children: ReactNode
  networkDefs: Record<ChainId, NetworkDef<TId, ChainId>>
  preferredScheme: 'light' | 'dark' | null
}) => {
  const networks = useMemo(() => recordValues(networkDefs), [networkDefs])
  const chains = useMemo(
    () => networks.map((network) => createChainFromNetwork(network, defaultGetRpcUrls)) as [Chain, ...Chain[]],
    [networks],
  )
  const transports = useMemo(
    () =>
      Object.fromEntries(
        networks.map((network) => [network.chainId, createTransportFromNetwork(network, defaultGetRpcUrls)]),
      ),
    [networks],
  )
  const config = useMemo(() => createWagmiConfig({ chains, transports }), [chains, transports])

  const pathname = usePathname()
  const push = useNavigate()
  useLayoutStoreResponsive()

  const onChainUnavailable = useCallback(
    ([walletChainId]: [ChainId, ChainId]) => {
      const network = networks[walletChainId]?.id
      if (pathname && network) {
        console.warn(`Network switched to ${network}, redirecting...`, pathname)
        push(replaceNetworkInPath(pathname, network))
      }
    },
    [networks, pathname, push],
  )
  const network = useNetworkFromUrl(networks)
  const theme = useThemeAfterSsr(preferredScheme)
  const currentApp = getCurrentApp(pathname)

  return (
    <StyledComponentsRegistry>
      {network && (
        <ThemeProvider theme={theme}>
          <OverlayProvider>
            <WagmiProvider config={config}>
              <QueryProvider persister={persister} queryClient={queryClient}>
                <ConnectionProvider app={currentApp} network={network} onChainUnavailable={onChainUnavailable}>
                  <GlobalLayout currentApp={currentApp} network={network} networks={networkDefs}>
                    {children}
                  </GlobalLayout>
                </ConnectionProvider>
              </QueryProvider>
            </WagmiProvider>
          </OverlayProvider>
        </ThemeProvider>
      )}
    </StyledComponentsRegistry>
  )
}
