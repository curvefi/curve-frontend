import delay from 'lodash/delay'
import { useLocation, useNavigate } from 'react-router'
import { ReactNode, useCallback, useEffect, useMemo, useState } from 'react'
import { WagmiProvider } from 'wagmi'
import { GlobalLayout } from '@/app/GlobalLayout'
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
import { ThemeKey } from '@ui-kit/themes/basic-theme'
import { ChadCssProperties } from '@ui-kit/themes/fonts'

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

function useNetworkFromUrl<ChainId extends number, NetworkConfig extends NetworkDef>(
  networks: Record<ChainId, NetworkConfig>,
) {
  const navigate = useNavigate()
  const location = useLocation()
  const pathname = location.pathname
  const networkId = getCurrentNetwork(pathname)
  const network = useMemo(() => recordValues(networks).find((n) => n.id == networkId), [networkId, networks])
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
 * TODO: Store the preference in a cookie so we can read it from the server.
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
 * This is the part of the root layout that needs to be a client component.
 */
export const ClientWrapper = <TId extends string, ChainId extends number>({
  children,
  networks,
  preferredScheme,
}: {
  children: ReactNode
  networks: Record<ChainId, NetworkDef<TId, ChainId>>
  preferredScheme: 'light' | 'dark' | null
}) => {
  const theme = useThemeAfterSsr(preferredScheme)
  const config = useMemo(() => createWagmiConfig(networks), [networks])
  const location = useLocation()
  const pathname = location.pathname
  const navigate = useNavigate()
  useLayoutStoreResponsive()

  const onChainUnavailable = useCallback(
    ([walletChainId]: [ChainId, ChainId]) => {
      const network = networks[walletChainId]?.id
      if (pathname && network) {
        console.warn(`Network switched to ${network}, redirecting...`, pathname)
        navigate(replaceNetworkInPath(pathname, network))
      }
    },
    [networks, pathname, navigate],
  )
  const network = useNetworkFromUrl(networks)

  const currentApp = getCurrentApp(pathname)
  return (
    network && (
      <div style={{ ...(theme === 'chad' && ChadCssProperties) }}>
        <GlobalStyle />
        <ThemeProvider theme={theme}>
          <OverlayProvider>
            <QueryProvider persister={persister} queryClient={queryClient}>
              <WagmiProvider config={config}>
                <ConnectionProvider app={currentApp} network={network} onChainUnavailable={onChainUnavailable}>
                  <GlobalLayout currentApp={currentApp} network={network} networks={networks}>
                    {children}
                  </GlobalLayout>
                </ConnectionProvider>
              </WagmiProvider>
            </QueryProvider>
          </OverlayProvider>
        </ThemeProvider>
      </div>
    )
  )
}
