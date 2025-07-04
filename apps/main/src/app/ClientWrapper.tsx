'use client'
import delay from 'lodash/delay'
import { usePathname, useRouter } from 'next/navigation'
import { ReactNode, useCallback, useEffect, useMemo } from 'react'
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
import type { UserProfileState } from '@ui-kit/features/user-profile/store'
import { persister, queryClient, QueryProvider } from '@ui-kit/lib/api'
import { getHashRedirectUrl } from '@ui-kit/shared/route-redirects'
import { getCurrentApp, getCurrentNetwork, replaceNetworkInPath } from '@ui-kit/shared/routes'
import { ThemeProvider } from '@ui-kit/shared/ui/ThemeProvider'
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

/**
 * Remove the old user profile from localStorage and migrate it to cookies so it can be read by the server.
 */
const useLocalStorageToCookieMigration = (userProfileCookie: UserProfileState | undefined) =>
  /* Example of the old localStorage values:
  "user-profile": { "state": { "theme": "light", "maxSlippage": { "crypto": "0.1", "stable": "0.03" }, "isAdvancedMode": true, "hideSmallPools": true }, "version": 1 },
  "beta": false,
  "filter-expanded-llamalend-markets": false,
  "favoriteMarkets": ["0x37417B2238AA52D0DD2D6252d989E728e8f706e4"]
   */
  useEffect(() => {
    const oldValues = Object.fromEntries(
      ['user-profile', 'beta', 'filter-expanded-llamalend-markets', 'favoriteMarkets']
        .map((key) => [key, localStorage.getItem(key)])
        .filter(([, value]) => value != null)
        .map(([key, value]) => [key, JSON.parse(value as string)]),
    )
    const newState = {
      ...oldValues['user-profile']?.state,
      ...('filter-expanded-llamalend-markets' in oldValues && {
        filterExpanded: { 'filter-expanded-llamalend-markets': oldValues['filter-expanded-llamalend-markets'] },
      }),
      ...('favoriteMarkets' in oldValues && { favoriteMarkets: oldValues['favoriteMarkets'] }),
      ...('beta' in oldValues && { beta: oldValues['beta'] }),
    }
    if (Object.keys(oldValues).length) {
      console.warn(`Migrating user profile from localStorage to cookies`, newState)
      useUserProfileStore.setState(newState)
      Object.keys(oldValues).forEach((key) => localStorage.removeItem(key))
    }
  }, [userProfileCookie])

/**
 * Hook to determine the initial theme based on the preferred scheme and user profile cookie.
 * If the cookie or the localStorage user profile is not set, it will set the theme to the preferred scheme.
 */
const useInitialTheme = (preferredScheme: 'light' | 'dark' | null, userProfileCookie: UserProfileState | undefined) =>
  useMemo(() => {
    const state = useUserProfileStore.getState()
    const userProfileStorage = typeof window === 'undefined' || !localStorage.getItem('user-profile')
    if (preferredScheme && !userProfileCookie && userProfileStorage) {
      state.setTheme(preferredScheme)
      return preferredScheme
    }
    return state.theme
  }, [preferredScheme, userProfileCookie])

/**
 * This is the part of the root layout that needs to be a client component.
 */
export const ClientWrapper = <TId extends string, ChainId extends number>({
  children,
  networks,
  preferredScheme,
  userProfileCookie,
}: {
  children: ReactNode
  networks: Record<ChainId, NetworkDef<TId, ChainId>>
  preferredScheme: 'light' | 'dark' | null
  userProfileCookie?: UserProfileState
}) => {
  const theme = useInitialTheme(preferredScheme, userProfileCookie)
  const config = useMemo(() => createWagmiConfig(networks), [networks])
  const pathname = usePathname()
  const { push } = useRouter()
  useLayoutStoreResponsive()
  useLocalStorageToCookieMigration(userProfileCookie)

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
